import ZoomVideo, {
  ConnectionState,
  Stream,
  VideoClient,
  VideoQuality,
  ConnectionChangePayload,
  ParticipantPropertiesPayload,
  CaptureVideoOption,
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

export class ZoomClient implements ZoomClientSDK {
  _client?: typeof VideoClient;
  _stream?: typeof Stream;
  _session?: string;
  _options: ZoomClientOptions;
  _usersAdded: User[];
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom?: boolean;
  _oneToOneToken?: string;

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;
  _defaultCaptureVideoOption?: CaptureVideoOption;
  _selectedMicrophoneId?: string;
  _teacherId?: string;

  _interval?: any;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._usersAdded = [];
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;

    this._selectedMicrophoneId = store.getters["microphoneDeviceId"];
    this._teacherId = store.getters["studentRoom/teacher"]?.id;
    this._defaultCaptureVideoOption = {
      hd: options.user.role === "host",
      cameraId: store.getters["cameraDeviceId"],
      captureWidth: options.user.role === "host" ? 1080 : 640,
      captureHeight: options.user.role === "host" ? 608 : 360,
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

  userAdded = async () => {
    Logger.log("user-added");
    await this.renderPeerVideos();
  };

  userUpdated = async () => {
    Logger.log("user-updated");
    await this.renderPeerVideos();
  };

  userRemoved = async (payload: ParticipantPropertiesPayload[]) => {
    payload.map((user) => {
      Logger.log("user-removed", user.userId);
    });
    await this.renderPeerVideos();
  };

  renderPeerVideos = async () => {
    const users = this._client?.getAllUser() ?? [];
    for (let index = 0; index < users.length; index++) {
      const canvas = document.getElementById(`${users[index]?.displayName}__sub`) as HTMLCanvasElement;
      if (canvas && canvas.width && canvas.height) {
        if (users[index]?.bVideoOn) {
          await this._stream?.renderVideo(canvas, users[index].userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
        } else {
          await this._stream?.stopRenderVideo(canvas, users[index].userId);
          await this._stream?.clearVideoCanvas(canvas);
        }
      }
    }
  };

  peerVideoStateChange = async (payload: { action: "Start" | "Stop"; userId: number }) => {
    const { action, userId } = payload;
    const user = this.client.getUser(userId);
    if (!user) return;
    const canvas = document.getElementById(`${user?.displayName}__sub`) as HTMLCanvasElement;
    if (canvas && canvas.width && canvas.height) {
      if (action === "Start") {
        await this._stream?.renderVideo(canvas, user.userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
      }
      if (action === "Stop") {
        await this._stream?.stopRenderVideo(canvas, userId);
        await this._stream?.clearVideoCanvas(canvas);
      }
    }
  };

  async joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
  }) {
    Logger.log("Join RTC room: ", options);
    this.isMicEnable = !!options.microphone;
    this.isCameraEnable = !!options.camera;

    this._client = this.zoomRTC.createClient();
    await this._client.init("en-US", "Global");

    await this._client.join(this.option.user.channel, this.option.user.token, this.option.user.username);
    this._selfId = this._client?.getSessionInfo().userId;
    this._stream = this._client?.getMediaStream();

    this.joined = true;

    if (this.isCameraEnable) {
      await this.startRenderLocalUserVideo();
    }
    await this.startAudio();
    this._client?.on("connection-change", this.onConnectionChange);
    this._client?.on("user-added", this.userAdded);
    this._client?.on("user-updated", this.userUpdated);
    this._client?.on("user-removed", this.userRemoved);
    this._client?.on("peer-video-state-change", this.peerVideoStateChange);
    this.createIntervalRenderingVideos();
  }

  async startAudio() {
    try {
      await this._stream?.startAudio();
      if (this._selectedMicrophoneId) {
        await this._stream?.switchMicrophone(this._selectedMicrophoneId);
      }
      if (this.isMicEnable) {
        await this._stream?.unmuteAudio();
      } else {
        await this._stream?.muteAudio();
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  removeListener() {
    this._client?.off("connection-change", this.onConnectionChange);
    this._client?.off("user-added", this.userAdded);
    this._client?.off("user-updated", this.userUpdated);
    this._client?.off("user-removed", this.userRemoved);
    this._client?.off("peer-video-state-change", this.peerVideoStateChange);
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
    await this._stream?.stopVideo();
    this.isCameraEnable = false;
  }

  async startRenderLocalUserVideo() {
    try {
      const video = document.getElementById(this.option.user.username + "__video") as HTMLVideoElement;
      if (video) {
        await this._stream?.startVideo({ videoElement: video, ...this._defaultCaptureVideoOption });
        this.isCameraEnable = true;
      } else {
        Logger.log("Can't find local user canvas");
      }
    } catch (error) {
      Logger.log(error);
    }
  }

  async rejoinRTCRoom(options: { studentId?: string; teacherId?: string; token?: string; channel: string }) {
    try {
      if (!this._client) return;
      Logger.log("Rejoin RTC room: ", options);
      try {
        this.removeListener();
        await this._stream?.stopVideo();
        await this._stream?.stopAudio();
        await this._client?.leave(options.token ? false : true);
      } catch (error) {
        Logger.error(error);
      }
      await this._client?.join(options.channel, options.token || this.option.user.token, this.option.user.username);
      if (this.isCameraEnable) {
        await this.startRenderLocalUserVideo();
      }
      await this.startAudio();
      this._client?.on("connection-change", this.onConnectionChange);
      this._client?.on("user-added", this.userAdded);
      this._client?.on("user-updated", this.userUpdated);
      this._client?.on("user-removed", this.userRemoved);
      this._client?.on("peer-video-state-change", this.peerVideoStateChange);
    } catch (error) {
      Logger.error(error);
    }
  }

  async teacherBreakoutRoom() {
    if (this.option.user.role !== "host") return;
    await this.rejoinRTCRoom({
      teacherId: this.option.user.username,
      token: this._oneToOneToken,
      channel: this.option.user.channel + "-one-to-one",
    });
    this._isInOneToOneRoom = true;
  }

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async teacherBackToMainRoom() {
    if (this.option.user.role !== "host") return;
    try {
      await this.rejoinRTCRoom({
        teacherId: this.option.user.username,
        channel: this.option.user.channel,
      });
      this._isInOneToOneRoom = false;
      this._oneToOneToken = undefined;
    } catch (error) {
      Logger.log(error);
    }
  }

  async studentBackToMainRoom() {
    if (!this._oneToOneStudentId) return;
    if (this.option.user.role === "host" || !this._isInOneToOneRoom) return;

    if (this.option.user.username === this._oneToOneStudentId) {
      Logger.log("Back to main room");
      await this.rejoinRTCRoom({
        studentId: this.option.user.username,
        channel: this.option.user.channel,
      });
      this._isInOneToOneRoom = false;
      this._oneToOneStudentId = undefined;
    }
  }

  async studentBreakoutRoom(oneToOneStudentId: string) {
    if (this._oneToOneStudentId) return;
    if (this.option.user.role === "host" || this._isInOneToOneRoom) return;

    if (this.option.user.username === oneToOneStudentId) {
      this._oneToOneStudentId = oneToOneStudentId;
      Logger.log("Breakout room");
      await this.rejoinRTCRoom({
        studentId: this.option.user.username,
        token: this._oneToOneToken,
        channel: this.option.user.channel + "-one-to-one",
      });
      this._isInOneToOneRoom = true;
    }
  }

  async reset() {
    Logger.log("Reset");
    await this._client?.leave(this.option.user.role === "host" ? true : false);
    this.removeListener();
    this.joined = false;
    this._stream = undefined;
    this._client = undefined;
    clearInterval(this._interval);
  }

  createIntervalRenderingVideos() {
    this._interval = setInterval(async () => {
      Logger.log("Rendering videos");
      if (this.isCameraEnable) {
        await this.startRenderLocalUserVideo();
      }
      await this.renderPeerVideos();
    }, 5000);
  }
}
