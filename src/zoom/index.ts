import { getPositionAndSize } from "./video-helper";
import { TeacherState } from "./../store/room/interface";
import ZoomVideo, {
  ConnectionState,
  Stream,
  VideoClient,
  VideoQuality,
  ConnectionChangePayload,
  ParticipantPropertiesPayload,
  CaptureVideoOption,
  ActiveSpeaker,
  VideoActiveState,
  Participant,
} from "@zoom/videosdk";
import { Logger } from "@/utils/logger";
import { store } from "@/store";

export interface ZoomClientSDK {
  joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
  }): void;
}

export interface ZoomClientOptions {
  user: ZoomUser;
}

export interface ZoomUser {
  channel: string;
  username: string;
  role: "host" | "audience";
  token: string;
}

export interface ZoomEventHandler {
  onLocalNetworkUpdate(payload: any): void;
}

export interface User {
  userId: number;
  displayName: string;
}

// 2160p: 3840x2160
// 1440p: 2560x1440
// 1080p: 1920x1080
// 720p: 1280x720
// 480p: 854x480
// 360p: 640x360
// 240p: 426x240

const HOST_CAPTURE_WIDTH = 1280;
const HOST_CAPTURE_HEIGHT = 720;

const CLIENT_CAPTURE_WIDTH = 640;
const CLIENT_CAPTURE_HEIGHT = 360;

const PARTICIPANT_CANVAS_ID = "participant-videos";

export class ZoomClient implements ZoomClientSDK {
  _client?: typeof VideoClient;
  _stream?: typeof Stream;
  _options: ZoomClientOptions;
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom: boolean;
  _isInOneToOneProgress: boolean;
  _oneToOneToken?: string;
  _renderedList: Participant[];
  _speakerTimeout: any = null;
  _isHost = false;

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;
  inprogress = false;

  _isBeforeOneToOneCameraEnable = false;

  _defaultCaptureVideoOption: CaptureVideoOption;
  _selectedMicrophoneId?: string;
  _selectedCameraId?: string;
  _teacherId?: string;

  _isNotSupportSharedArrayBuffer: boolean;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._isInOneToOneProgress = false;
    this._renderedList = [];
    this._isHost = options.user.role === "host";
    this._selectedMicrophoneId = store.getters["microphoneDeviceId"];
    this._selectedCameraId = store.getters["cameraDeviceId"];
    this._teacherId = store.getters["studentRoom/teacher"]?.id;
    this._isNotSupportSharedArrayBuffer = !!(window as any).chrome && !(typeof SharedArrayBuffer === "function");

    this._defaultCaptureVideoOption = {
      hd: false,
      cameraId: this._selectedCameraId,
      captureWidth: options.user.role === "host" ? HOST_CAPTURE_WIDTH : CLIENT_CAPTURE_WIDTH,
      captureHeight: options.user.role === "host" ? HOST_CAPTURE_HEIGHT : CLIENT_CAPTURE_HEIGHT,
    };
  }

  get option() {
    return this._options as ZoomClientOptions;
  }

  get zoomRTC(): typeof ZoomVideo {
    return ZoomVideo;
  }

  set oneToOneToken(token: string) {
    this._oneToOneToken = token;
  }

  set oneToOneStudentId(studentId: string) {
    this._oneToOneStudentId = studentId;
  }

  onConnectionChange = (payload: ConnectionChangePayload) => {
    if (payload.state === ConnectionState.Connected) {
      Logger.log("connection-change", ConnectionState.Connected);
    } else if (payload.state === ConnectionState.Reconnecting) {
      Logger.log("connection-change", ConnectionState.Reconnecting);
    }
  };

  userAdded = async (payload: ParticipantPropertiesPayload[]) => {
    if (!store.getters["auth/isTeacher"] && this._client?.getCurrentUserInfo()?.isHost) {
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index];
        Logger.log("user-added: ", element.displayName);
        if ((store.getters["studentRoom/teacher"] as TeacherState)?.id === element.displayName) {
          await this._client?.makeHost(element.userId);
          return;
        }
      }
    }
  };

  userUpdated = async (payload: ParticipantPropertiesPayload[]) => {
    if (payload.filter(({ userId }) => userId !== this._selfId).some((participant) => "bVideoOn" in participant)) {
      await this.renderPeerVideos();
    }
  };

  userRemoved = async (payload: ParticipantPropertiesPayload[]) => {
    Logger.log("User removed", payload);
    for (const user of payload) {
      const shouldRemoveParticipant = this._renderedList.find(({ userId }) => userId === user.userId);
      if (!shouldRemoveParticipant) return;
      await this.stopRenderParticipantVideo(shouldRemoveParticipant);
      this._renderedList = this._renderedList.filter(({ userId }) => userId !== shouldRemoveParticipant.userId);
    }
  };

  activeSpeaker = (payload: Array<ActiveSpeaker>) => {
    if (this._speakerTimeout) {
      clearTimeout(this._speakerTimeout);
    }
    const ids = payload.map(({ displayName }) => ({ uid: displayName, level: 1 }));
    if (this._isHost) {
      store.dispatch("teacherRoom/setSpeakingUsers", ids);
    } else {
      store.dispatch("studentRoom/setSpeakingUsers", ids);
    }
    this._speakerTimeout = setTimeout(() => {
      if (this._isHost) {
        store.dispatch("teacherRoom/setSpeakingUsers", []);
      } else {
        store.dispatch("studentRoom/setSpeakingUsers", []);
      }
    }, 1000);
  };

  stopRenderParticipantVideo = async (user: Participant) => {
    try {
      const { userId, displayName } = user;
      const participantElementId = `${displayName}__sub`;
      if (!this._isHost && displayName === this._teacherId) {
        const canvas = document.getElementById(participantElementId) as HTMLCanvasElement;
        if (canvas) {
          await this._stream?.stopRenderVideo(canvas, userId);
          return;
        }
      }
      const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      if (canvas) {
        await this._stream?.stopRenderVideo(canvas, userId);
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderParticipantVideo = async (user: Participant) => {
    try {
      const { userId, displayName } = user;
      if (displayName === store.getters["studentRoom/teacher"]?.id || displayName === store.getters["teacherRoom/getStudentModeOneId"]) {
        const participantElementId = `${displayName}__sub`;
        const canvas = document.getElementById(participantElementId) as HTMLCanvasElement;
        if (canvas) {
          await this._stream?.renderVideo(canvas, userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_90P);
        }
      } else {
        const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
        const position = getPositionAndSize(this._isHost, displayName, canvas);
        if (position && canvas) {
          await this._stream?.renderVideo(canvas, userId, position.w, position.h, position.x, position.y, VideoQuality.Video_90P);
        }
      }
    } catch (error) {
      Logger.log("Render video error: ", error);
    }
  };

  rerenderParticipantsVideo = async () => {
    Logger.log("Rerender participants video");
    try {
      const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      for (const participant of this._renderedList) {
        const { userId, displayName } = participant;
        const position = getPositionAndSize(this._isHost, displayName, canvas);
        if (position && canvas) {
          await this._stream?.adjustRenderedVideoPosition(canvas, userId, position.w, position.h, position.x, position.y);
        }
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderPeerVideos = async () => {
    await this.rerenderParticipantsVideo();

    const users = this._client?.getAllUser().filter(({ userId }) => userId !== this._selfId) ?? [];

    if (!users.length && this._renderedList) {
      Logger.log("Remove all rendered students");
      for (const user of this._renderedList) {
        await this.stopRenderParticipantVideo(user);
      }
      this._renderedList = [];
    }

    const shouldRenderParticipants = users.filter(({ bVideoOn }) => bVideoOn);

    const shouldRemoveParticipants = users.filter(({ bVideoOn }) => !bVideoOn);

    const shouldAddedParticipants = shouldRenderParticipants.filter(
      ({ userId, displayName }) =>
        this._renderedList.findIndex(
          ({ userId: renderedId, displayName: renderedDisplayName }) => userId === renderedId || displayName === renderedDisplayName,
        ) === -1,
    );

    for (const user of shouldRemoveParticipants) {
      if (this._renderedList.find(({ displayName }) => displayName === user.displayName)) {
        await this.stopRenderParticipantVideo(user);
      }
    }

    for (const user of shouldAddedParticipants) {
      Logger.log("Should render:", user);
      await this.renderParticipantVideo(user);
    }
    this._renderedList = [...shouldRenderParticipants];
  };

  async joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
    idOne?: string;
  }) {
    try {
      this.isMicEnable = !!options.microphone;
      this.isCameraEnable = !!options.camera;

      this._client = this.zoomRTC.createClient();
      await this._client.init("en-US", "Global", {
        webEndpoint: "zoom.us",
        enforceMultipleVideos: !window.crossOriginIsolated,
      });
      let token = this.option.user.token;
      let channel = this.option.user.channel;
      if (options.idOne && this._oneToOneToken) {
        token = this._oneToOneToken;
        channel += "-one-to-one";
      }
      Logger.log("Join RTC room: ", { ...options, channel, token });

      await this._client.join(channel, token, this.option.user.username);
      this.joined = true;
      this._selfId = this._client?.getSessionInfo().userId;
      this._stream = this._client?.getMediaStream();

      if (this.isCameraEnable) {
        await this.setCamera({ enable: this.isCameraEnable });
      }
      await this.startAudio();

      this.registerListener();
      await this.renderPeerVideos();
    } catch (error) {
      this.joined = false;
      Logger.error(error);

      this.zoomRTC.destroyClient();
      await this.joinRTCRoom(options);
    }
  }

  replaceVideoCanvas = (elementId: string) => {
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    if (canvas) {
      const cloneCanvas = canvas.cloneNode();
      canvas.replaceWith(cloneCanvas);
    }
  };

  async rejoinRTCRoom(options: { studentId?: string; teacherId?: string; token?: string; channel: string }) {
    try {
      if (!this._client) return;
      await this.stopAudio();

      await this.proactiveDisableVideos(options.teacherId ?? options.studentId);
      // replace self canvas
      this.replaceVideoCanvas(this.option.user.username + "__video");

      // remove all students video
      for (const user of this._renderedList) {
        await this.stopRenderParticipantVideo(user);
      }
      this._renderedList = [];
      this.replaceVideoCanvas(PARTICIPANT_CANVAS_ID);

      await this.leaveSession();

      Logger.log("Rejoin RTC room: ", options);

      await this._client?.join(options.channel, options.token ?? this.option.user.token, this.option.user.username);
      this._stream = this._client?.getMediaStream();
      this._selfId = this._client?.getCurrentUserInfo().userId;

      await this.startAudio();

      if (this._isBeforeOneToOneCameraEnable) {
        Logger.log("Turn on my video again");
        if (this._isHost) {
          await store.dispatch("teacherRoom/setTeacherVideo", {
            id: options.teacherId,
            enable: true,
          });
        } else {
          await store.dispatch("studentRoom/setStudentVideo", {
            id: options.studentId,
            enable: true,
          });
        }
        this._isBeforeOneToOneCameraEnable = false;
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async stopAudio() {
    try {
      if (this.isMicEnable) {
        await this._stream?.stopAudio();
      }
    } catch (error) {
      Logger.error("Stop audio error: ", error);
    }
  }

  async muteAudio() {
    try {
      await this._stream?.muteAudio();
    } catch (error) {
      Logger.error("Mute audio error: ", error);
      await this.delay(200);
      await this._stream?.muteAudio();
    }
  }

  async startAudio() {
    try {
      await this._stream?.startAudio();
      if (!this._selectedMicrophoneId) {
        const devices = await this.zoomRTC?.getDevices();
        const mics = devices.filter(function (device) {
          return device.kind === "audioinput";
        });
        if (!mics.length) {
          throw new Error("Cannot detect your microphone");
        }
        this._selectedMicrophoneId = mics[0].deviceId;
      }
      if (this._selectedMicrophoneId) {
        await this._stream?.switchMicrophone(this._selectedMicrophoneId);
      }

      if (!this.isMicEnable) {
        // to avoid SDK not receiving media device
        await this.delay(200);
        await this.muteAudio();
      }
    } catch (error) {
      Logger.error("Start audio error: ", error);
    }
  }

  videoActiveChange = async (payload: { state: VideoActiveState; userId: number }) => {
    if (payload.state === VideoActiveState.Active) {
      const user = this._client?.getUser(payload.userId);
      if (!user) return;
      await this.renderParticipantVideo(user);
    }
  };

  registerListener() {
    Logger.log("Register listener");
    this._client?.on("connection-change", this.onConnectionChange);
    this._client?.on("user-added", this.userAdded);
    this._client?.on("user-updated", this.userUpdated);
    this._client?.on("user-removed", this.userRemoved);
    this._client?.on("active-speaker", this.activeSpeaker);
    this._client?.on("video-active-change", this.videoActiveChange);
  }

  removeListener() {
    try {
      Logger.log("Remove all listener");
      this._client?.off("connection-change", this.onConnectionChange);
      this._client?.off("user-added", this.userAdded);
      this._client?.off("user-updated", this.userUpdated);
      this._client?.off("user-removed", this.userRemoved);
      this._client?.off("active-speaker", this.activeSpeaker);
      this._client?.off("video-active-change", this.videoActiveChange);
    } catch (error) {
      Logger.error(error);
    }
  }

  async setMicrophone(options: { enable: boolean }) {
    this.isMicEnable = options.enable;
    if (this.isMicEnable) {
      return this._stream?.unmuteAudio();
    } else {
      return this._stream?.muteAudio();
    }
  }

  async setCamera(options: { enable: boolean }) {
    this.isCameraEnable = options.enable;
    if (this.isCameraEnable) {
      await this.startRenderLocalUserVideo();
    } else {
      await this.stopRenderLocalUserVideo();
    }
  }

  async stopRenderLocalUserVideo() {
    Logger.log("Stop render local user video");
    try {
      await this._stream?.stopVideo();
    } catch (error) {
      Logger.error("Stop render local user video: ", error);
    }
  }

  async startRenderLocalUserVideo() {
    try {
      if (!this._selectedCameraId) {
        const devices = await this.zoomRTC?.getDevices();
        const cams = devices.filter(function (device) {
          return device.kind === "videoinput";
        });
        if (!cams.length) {
          throw new Error("Cannot detect your camera");
        }
        this._selectedCameraId = cams[0].deviceId;
        this._defaultCaptureVideoOption.cameraId = this._selectedCameraId;
      }
      const mineVideoElementId = this.option.user.username + "__video";
      if (this._isNotSupportSharedArrayBuffer) {
        const video = document.getElementById(mineVideoElementId) as HTMLVideoElement;
        if (video) {
          await this._stream?.startVideo({ ...this._defaultCaptureVideoOption, videoElement: video });
        }
      } else {
        const canvas = document.getElementById(mineVideoElementId) as HTMLCanvasElement;
        if (canvas && this._selfId) {
          await this._stream?.startVideo(this._defaultCaptureVideoOption);
          await this._stream?.renderVideo(canvas, this._selfId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
        }
      }
    } catch (error) {
      Logger.error("Start render local user video: ", error);
    }
  }

  async proactiveDisableVideos(id?: string) {
    try {
      if (!id) return;
      if (this.isCameraEnable) {
        Logger.log("Turn off my video");
        if (this._isHost) {
          await store.dispatch("teacherRoom/setTeacherVideo", {
            id,
            enable: false,
          });
        } else {
          await store.dispatch("studentRoom/setStudentVideo", {
            id,
            enable: false,
          });
        }
        this._isBeforeOneToOneCameraEnable = true;
      }
    } catch (error) {
      Logger.error("Proactive Disable Videos", error);
    }
  }

  async leaveSession() {
    try {
      await this._client?.leave();
    } catch (error) {
      Logger.error(error);
    }
  }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async teacherBreakoutRoom() {
    const { username, channel } = this.option.user;
    if (!this._isHost) return;
    try {
      await this.rejoinRTCRoom({
        teacherId: username,
        token: this._oneToOneToken,
        channel: channel + "-one-to-one",
      });
      this._isInOneToOneRoom = true;
    } catch (error) {
      Logger.log(error);
    }
  }

  async teacherBackToMainRoom() {
    const { username, channel } = this.option.user;
    if (!this._isHost) return;
    try {
      await this.rejoinRTCRoom({
        teacherId: username,
        channel: channel,
      });
      this._isInOneToOneRoom = false;
      this._oneToOneToken = undefined;
    } catch (error) {
      Logger.log(error);
    }
  }

  async studentBreakoutRoom(oneToOneStudentId: string) {
    this.replaceVideoCanvas(`${this._teacherId}__sub`);
    if (this._oneToOneStudentId) return;
    const { username, channel } = this.option.user;
    if (this._isHost || this._isInOneToOneRoom) return;
    if (this._isInOneToOneProgress) return;

    this._isInOneToOneProgress = true;
    if (username === oneToOneStudentId) {
      this._oneToOneStudentId = oneToOneStudentId;
      Logger.log("Breakout room");
      await this.rejoinRTCRoom({
        studentId: username,
        token: this._oneToOneToken,
        channel: channel + "-one-to-one",
      });
      this._isInOneToOneRoom = true;
    }
    this._isInOneToOneProgress = false;
  }

  async studentBackToMainRoom() {
    this.replaceVideoCanvas(`${this._teacherId}__sub`);
    if (!this._oneToOneStudentId) return;
    const { username, channel } = this.option.user;
    if (this._isHost || !this._isInOneToOneRoom) return;
    if (this._isInOneToOneProgress) return;

    this._isInOneToOneProgress = true;
    if (username === this._oneToOneStudentId) {
      Logger.log("Back to main room");
      await this.rejoinRTCRoom({
        studentId: username,
        channel: channel,
      });
      this._isInOneToOneRoom = false;
      this._oneToOneToken = undefined;
      this._oneToOneStudentId = undefined;
    }
    this._isInOneToOneProgress = false;
  }

  async reset(end = false) {
    Logger.log("Reset");
    this.isCameraEnable = false;
    this.isMicEnable = false;
    this.removeListener();
    if (this.isCameraEnable) {
      await this._stream?.stopVideo();
    }
    if (this.isMicEnable) {
      await this._stream?.stopAudio();
    }
    await this._client?.leave(end);
    this.joined = false;
    this._stream = undefined;
    this._client = undefined;
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._renderedList = [];

    this.zoomRTC.destroyClient();
  }
}
