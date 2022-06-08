import ZoomVideo, {
  ConnectionState,
  Stream,
  VideoClient,
  VideoQuality,
  ConnectionChangePayload,
  ParticipantPropertiesPayload,
  CaptureVideoOption,
  Participant,
  ActiveSpeaker,
} from "@zoom/videosdk";
import { Logger } from "@/utils/logger";
import { store } from "@/store";

export interface ZoomClientSDK {
  client: typeof VideoClient;
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

export class ZoomClient implements ZoomClientSDK {
  _client?: typeof VideoClient;
  _stream?: typeof Stream;
  _session?: string;
  _options: ZoomClientOptions;
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom: boolean;
  _oneToOneToken?: string;
  _renderedList: Participant[];
  _speakerTimeout: any = null;

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;
  inprogress = false;

  _isBeforeOneToOneCameraEnable = false;
  _isBeforeOneToOneCameraStudentEnable = false;

  _defaultCaptureVideoOption: CaptureVideoOption;
  _selectedMicrophoneId?: string;
  _selectedCameraId?: string;
  _teacherId?: string;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._renderedList = [];

    this._selectedMicrophoneId = store.getters["microphoneDeviceId"];
    this._selectedCameraId = store.getters["cameraDeviceId"];
    this._teacherId = store.getters["studentRoom/teacher"]?.id;
    this._defaultCaptureVideoOption = {
      hd: options.user.role === "host",
      cameraId: this._selectedCameraId,
      captureWidth: options.user.role === "host" ? HOST_CAPTURE_WIDTH : CLIENT_CAPTURE_WIDTH,
      captureHeight: options.user.role === "host" ? HOST_CAPTURE_HEIGHT : CLIENT_CAPTURE_HEIGHT,
      mirrored: true,
    };
  }

  get client() {
    return this._client as typeof VideoClient;
  }

  get selfId() {
    return this._selfId as number;
  }

  get stream() {
    return this._stream as typeof Stream;
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

  userAdded = () => {
    Logger.log("user-added");
  };

  userUpdated = async () => {
    Logger.log("user-updated");
    await this.renderPeerVideos();
  };

  userRemoved = async (payload: ParticipantPropertiesPayload[]) => {
    payload.forEach(async (user) => {
      Logger.log("user-removed", user.userId);
      const shouldRemoveParticipant = this._renderedList.find(({ userId }) => userId === user.userId);
      if (shouldRemoveParticipant) {
        await this.stopRenderParticipantVideo(shouldRemoveParticipant);
        this._renderedList = this._renderedList.filter(({ userId }) => userId !== user.userId);
      }
    });
    await this.renderPeerVideos();
  };

  currentAudioChange = async (payload: { action: string; source: string }) => {
    Logger.log(payload);
  };

  activeSpeaker = (payload: Array<ActiveSpeaker>) => {
    const { role } = this.option.user;
    if (this._speakerTimeout) {
      clearTimeout(this._speakerTimeout);
    }
    const ids = payload.map(({ displayName }) => ({ uid: displayName, level: 1 }));
    if (role === "host") {
      store.dispatch("teacherRoom/setSpeakingUsers", ids);
    } else {
      store.dispatch("studentRoom/setSpeakingUsers", ids);
    }
    this._speakerTimeout = setTimeout(() => {
      if (role === "host") {
        store.dispatch("teacherRoom/setSpeakingUsers", []);
      } else {
        store.dispatch("studentRoom/setSpeakingUsers", []);
      }
    }, 1000);
  };

  renderParticipantVideo = async (user: Participant) => {
    try {
      const { userId, displayName } = user;
      const canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
      if (canvas) {
        const clonedCanvas = canvas.cloneNode(true);
        canvas.replaceWith(clonedCanvas);
        const _canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
        await this._stream?.renderVideo(_canvas, userId, _canvas.width, _canvas.height, 0, 0, VideoQuality.Video_360P);
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  stopRenderParticipantVideo = async (user: Participant) => {
    try {
      const { userId, displayName } = user;
      const canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
      if (canvas) {
        await this._stream?.stopRenderVideo(canvas, userId, undefined, "#E7E7E7");
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderPeerVideos = () => {
    const users = this._client?.getAllUser()?.filter(({ userId }) => userId !== this.selfId) ?? [];
    if (!users.length && this._renderedList) {
      this._renderedList.forEach(async (user) => {
        await this.stopRenderParticipantVideo(user);
      });
      this._renderedList = [];
    }

    const shouldRenderParticipants = users.filter(({ bVideoOn }) => bVideoOn);

    const shouldRemoveParticipants = users.filter(({ bVideoOn }) => !bVideoOn);

    const shouldAddedParticipants = shouldRenderParticipants.filter(
      ({ userId }) => this._renderedList.findIndex(({ userId: renderedId }) => userId === renderedId) === -1,
    );

    shouldAddedParticipants.forEach(async (user) => {
      await this.renderParticipantVideo(user);
    });

    if (shouldRemoveParticipants.length) {
      shouldRemoveParticipants.forEach(async (user) => {
        await this.stopRenderParticipantVideo(user);
      });
    }
    this._renderedList = [...shouldRenderParticipants];
  };

  async joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
  }) {
    if (this.inprogress) return;
    this.inprogress = true;
    try {
      Logger.log("Join RTC room: ", options);
      this.isMicEnable = !!options.microphone;
      this.isCameraEnable = !!options.camera;

      this._client = this.zoomRTC.createClient();
      await this._client.init("en-US", "Global");

      await this._client.join(this.option.user.channel, this.option.user.token, this.option.user.username);
      this.joined = true;
      this._selfId = this._client?.getSessionInfo().userId;
      this._stream = this._client?.getMediaStream();

      if (this.isCameraEnable) {
        await this.startRenderLocalUserVideo();
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
    this.inprogress = false;
  }

  async rejoinRTCRoom(options: { studentId?: string; teacherId?: string; token?: string; channel: string }) {
    const isBackToMainRoom = !options.token;
    try {
      if (!this._client) return;
      const { role } = this.option.user;
      Logger.log("Rejoin RTC room: ", options);
      if (role === "host") {
        await this.proactiveDisableVideos(options.teacherId);
      }
      await this.stopAudio();
	  this.removeListener()
      await this.leaveSessionForOneToOne(isBackToMainRoom);
      await this._client?.join(options.channel, options.token ?? this.option.user.token, this.option.user.username);
      this._selfId = this._client?.getSessionInfo().userId;
      this._stream = this._client?.getMediaStream();
      await this.startAudio();

      if (role === "host" && this._isBeforeOneToOneCameraEnable) {
        Logger.log("Turn on my video again");
        await store.dispatch("teacherRoom/setTeacherVideo", {
          id: options.teacherId,
          enable: true,
        });
        this._isBeforeOneToOneCameraEnable = false;
      }
      if (role === "host" && this._isBeforeOneToOneCameraStudentEnable) {
        Logger.log("Turn on one to one student again");
        await store.dispatch("teacherRoom/setStudentVideo", {
          id: this._oneToOneStudentId,
          enable: true,
        });
        this._isBeforeOneToOneCameraStudentEnable = false;
      }
	  this.registerListener()
    } catch (error) {
      Logger.error(error);
    }
  }

  async stopAudio() {
    try {
      await this._stream?.stopAudio();
    } catch (error) {
      Logger.error("Stop audio error: ", error);
    }
  }

  async muteAudio() {
    try {
      await this._stream?.muteAudio();
    } catch (error) {
      Logger.error("Mute audio error: ", error);
      await this.delay(500);
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
        await this.delay(500);
        await this.muteAudio();
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  registerListener() {
    Logger.log("Register listener");
    this._client?.on("connection-change", this.onConnectionChange);
    this._client?.on("user-added", this.userAdded);
    this._client?.on("user-updated", this.userUpdated);
    this._client?.on("user-removed", this.userRemoved);
    this._client?.on("active-speaker", this.activeSpeaker);
    this._client?.on("current-audio-change", this.currentAudioChange);
  }

  removeListener() {
    try {
      Logger.log("Remove all listener");
      this._client?.off("connection-change", this.onConnectionChange);
      this._client?.off("user-added", this.userAdded);
      this._client?.off("user-updated", this.userUpdated);
      this._client?.off("user-removed", this.userRemoved);
      this._client?.off("active-speaker", this.activeSpeaker);
      this._client?.off("current-audio-change", this.currentAudioChange);
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
    if (this.isCameraEnable === options.enable) return;
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
    this.isCameraEnable = false;
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

      if (!!(window as any).chrome && !(typeof SharedArrayBuffer === "function")) {
        const video = document.getElementById(this.option.user.username + "__video") as HTMLVideoElement;
        if (video) {
          await this._stream?.startVideo({ ...this._defaultCaptureVideoOption, videoElement: video });
        }
      } else {
        const canvas = document.getElementById(this.option.user.username + "__video") as HTMLCanvasElement;
        if (canvas && this._selfId) {
          await this._stream?.startVideo({ ...this._defaultCaptureVideoOption });
          await this._stream?.renderVideo(canvas, this._selfId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_720P);
        }
      }
    } catch (error) {
      Logger.error(error);
    }
    this.isCameraEnable = true;
  }

  async proactiveDisableVideos(id?: string) {
    try {
      if (!id) return;
      const { role } = this.option.user;
      if (role === "host") {
        if (this.isCameraEnable) {
          this._isBeforeOneToOneCameraEnable = true;
          Logger.log("Turn off my video");
          await store.dispatch("teacherRoom/setTeacherVideo", {
            id: id,
            enable: false,
          });
        }
        const students = store.getters["teacherRoom/students"];
        const isOneToOneStudentEnabledVideo = students?.find((student: any) => student.id === this._oneToOneStudentId)?.videoEnabled;
        if (isOneToOneStudentEnabledVideo) {
          this._isBeforeOneToOneCameraStudentEnable = true;
          await store.dispatch("teacherRoom/setStudentVideo", {
            id: this._oneToOneStudentId,
            enable: false,
          });
        }
      }
      await this.delay(200);
    } catch (error) {
      Logger.error("Proactive Disable Videos", error);
    }
  }

  async leaveSessionForOneToOne(shouldEnd: boolean) {
    try {
      if (this.option.user.role === "host") {
        await this._client?.leave(shouldEnd);
      } else {
        await this._client?.leave();
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async teacherBreakoutRoom(oneToOneStudentId: string) {
    this._oneToOneStudentId = oneToOneStudentId;
    const { role, username, channel } = this.option.user;
    if (role !== "host") return;
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
    const { role, username, channel } = this.option.user;
    if (role !== "host") return;
    try {
      await this.rejoinRTCRoom({
        teacherId: username,
        channel: channel,
      });
      this._isInOneToOneRoom = false;
      this._oneToOneStudentId = undefined;
      this._oneToOneToken = undefined;
    } catch (error) {
      Logger.log(error);
    }
  }

  async studentBreakoutRoom(oneToOneStudentId: string) {
    if (this._oneToOneStudentId) return;
    const { role, username, channel } = this.option.user;
    if (role === "host" || this._isInOneToOneRoom) return;

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
  }

  async studentBackToMainRoom() {
    if (!this._oneToOneStudentId) return;
    const { role, username, channel } = this.option.user;
    if (role === "host" || !this._isInOneToOneRoom) return;

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
