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
} from "@zoom/videosdk";
import { Logger } from "@/utils/logger";
import { store } from "@/store";
import { isEqual } from "lodash";

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

export interface ClassmateVideo {
  userId: number;
  bVideoOn: boolean;
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
  _options: ZoomClientOptions;
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom: boolean;
  _isInOneToOneProgress: boolean;
  _oneToOneToken?: string;
  _renderedList: ClassmateVideo[];
  _sessionParticipants: ClassmateVideo[];
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
    this._sessionParticipants = [];
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
      Logger.log("user-updated");
      await this.renderPeerVideos();
    }
  };

  userRemoved = async (payload: ParticipantPropertiesPayload[]) => {
    for (const user of payload) {
      Logger.log("user-removed", user.userId);
      const shouldRemoveParticipant = this._renderedList.find(({ userId }) => userId === user.userId);
      if (shouldRemoveParticipant) {
        await this.stopRenderParticipantVideo(shouldRemoveParticipant);
        this._renderedList = this._renderedList.filter(({ userId }) => userId !== user.userId);
      }
    }
    await this.renderPeerVideos();
  };

  currentAudioChange = async (payload: { action: string; source: string }) => {
    Logger.log(payload);
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

  stopRenderParticipantVideo = async (user: ClassmateVideo) => {
    try {
      const { userId, displayName } = user;
	  const participantElementId = `${displayName}__sub`
      const specialCanvas = document.getElementById(participantElementId) as HTMLCanvasElement;
      if (specialCanvas && specialCanvas.tagName === "CANVAS") {
        await this._stream?.stopRenderVideo(specialCanvas, userId);
        return;
      }
      const canvas = document.getElementById("participant-videos") as HTMLCanvasElement;
      if (canvas) {
        await this._stream?.stopRenderVideo(canvas, userId);
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderParticipantVideo = async (user: ClassmateVideo) => {
    try {
      const { userId, displayName } = user;
      if (displayName === store.getters["studentRoom/teacher"]?.id || displayName === store.getters["teacherRoom/getStudentModeOneId"]) {
		const participantElementId = `${displayName}__sub`
        const canvas = document.getElementById(participantElementId) as HTMLCanvasElement;
        if (canvas) {
          await this._stream?.renderVideo(canvas, userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_90P);
        }
      } else {
        const position = getPositionAndSize(this._isHost, displayName);
        const canvas = document.getElementById("participant-videos") as HTMLCanvasElement;
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
      const canvas = document.getElementById("participant-videos") as HTMLCanvasElement;
      for (let index = 0; index < this._renderedList.length; index++) {
        const user = this._renderedList[index];
        const { userId, displayName } = user;
        const position = getPositionAndSize(this._isHost, displayName);
        if (position && canvas) {
          await this._stream?.adjustRenderedVideoPosition(canvas, userId, position.w, position.h, position.x, position.y);
        }
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderPeerVideos = async () => {
    const users = this._client?.getAllUser().filter(({ userId }) => userId !== this._selfId) ?? [];
    const classmates: ClassmateVideo[] = users.map(({ userId, bVideoOn, displayName }) => ({ userId, bVideoOn, displayName }));
    if (isEqual(classmates, this._sessionParticipants)) return;

    if (!classmates.length && this._renderedList) {
      for (let index = 0; index < this._renderedList.length; index++) {
        const user = this._renderedList[index];
        await this.stopRenderParticipantVideo(user);
      }
      this._renderedList = [];
    }

    const shouldRenderParticipants = classmates.filter(({ bVideoOn }) => bVideoOn);

    const shouldRemoveParticipants = classmates.filter(({ bVideoOn }) => !bVideoOn);

    const shouldAddedParticipants = shouldRenderParticipants.filter(
      ({ userId, displayName }) =>
        this._renderedList.findIndex(
          ({ userId: renderedId, displayName: renderedDisplayName }) => userId === renderedId || displayName === renderedDisplayName,
        ) === -1,
    );

    for (const user of shouldAddedParticipants) {
      console.log("Turn on video: ", user.displayName);
      await this.renderParticipantVideo(user);
    }

    if (shouldRemoveParticipants.length) {
      for (const user of shouldRemoveParticipants) {
        if (this._renderedList.find(({ displayName }) => displayName === user.displayName)) {
          await this.stopRenderParticipantVideo(user);
        }
      }
    }
    this._renderedList = [...shouldRenderParticipants];
    this._sessionParticipants = [...classmates];

	await this.rerenderParticipantsVideo();
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
        await this.setCamera({enable: true})
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
    try {
      if (!this._client) return;
      await this.stopAudio();

      Logger.log("Rejoin RTC room: ", options);
      await this.proactiveDisableVideos(options.teacherId ?? options.studentId);

	  const studentsCanvas = document.getElementById("participant-videos") as HTMLCanvasElement;
	  for (const user of this._renderedList) {
		await this.stopRenderParticipantVideo(user)
	  }
	  this._renderedList = []
	  await this._stream?.clearVideoCanvas(studentsCanvas)

      await this.leaveSessionForOneToOne();
      await this._client?.join(options.channel, options.token ?? this.option.user.token, this.option.user.username);
      this._stream = this._client?.getMediaStream();
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
    this.isCameraEnable = options.enable;
    if (this.isCameraEnable) {
      await this.startRenderLocalUserVideo();
    } else {
      await this.stopRenderLocalUserVideo();
    }
  }

  async stopRenderLocalUserVideo() {
    Logger.log("Stop render local user video: ", this.isCameraEnable);
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

	  const mineVideoElementId = this.option.user.username + "__video"

      if (this._isNotSupportSharedArrayBuffer) {
        const video = document.getElementById(mineVideoElementId) as HTMLVideoElement;
        if (video) {
          await this._stream?.startVideo({ ...this._defaultCaptureVideoOption, videoElement: video });
        }
      } else {
		const selfId = this._client?.getSessionInfo().userId;
		if(selfId !== this._selfId){
			const canvas = document.getElementById(mineVideoElementId) as HTMLCanvasElement;
			const clonedCanvas = canvas.cloneNode();
			canvas.replaceWith(clonedCanvas);
			this._selfId = selfId
		}
        const canvas = document.getElementById(mineVideoElementId) as HTMLCanvasElement;
        if (canvas && this._selfId) {
          await this._stream?.startVideo(this._defaultCaptureVideoOption);
          await this._stream?.renderVideo(canvas, this._selfId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
        }
      }
    } catch (error) {
      Logger.error(error);
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
		await this.delay(200)
      }
    } catch (error) {
      Logger.error("Proactive Disable Videos", error);
    }
  }

  async leaveSessionForOneToOne() {
    try {
      await this._client?.leave();
    } catch (error) {
      Logger.error(error);
    }
  }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async teacherBreakoutRoom(oneToOneStudentId: string) {
    this._oneToOneStudentId = oneToOneStudentId;
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
      this._oneToOneStudentId = undefined;
      this._oneToOneToken = undefined;
    } catch (error) {
      Logger.log(error);
    }
  }

  async studentBreakoutRoom(oneToOneStudentId: string) {
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
