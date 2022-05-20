import ZoomVideo, {
  ConnectionState,
  Stream,
  VideoClient,
  VideoQuality,
  ConnectionChangePayload,
  ParticipantPropertiesPayload,
  CaptureVideoOption,
  Participant,
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
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom: boolean;
  _oneToOneToken?: string;
  _renderedList: Participant[];

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;
  inprogress = false;

  _defaultCaptureVideoOption?: CaptureVideoOption;
  _selectedMicrophoneId?: string;
  _teacherId?: string;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._renderedList = [];

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

  userAdded = () => {
    Logger.log("user-added");
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

  renderPeerVideos = () => {
    const users = this._client?.getAllUser()?.filter(({ userId }) => userId !== this.selfId) ?? [];

    if (!users.length && this._renderedList) {
      this._renderedList.forEach(async (user) => {
        const { userId, displayName } = user;
        const canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
        if (canvas) {
          await this._stream?.stopRenderVideo(canvas, userId);
        }
      });
      this._renderedList = [];
    }

    const shouldRenderParticipants = users.filter(({ bVideoOn }) => bVideoOn);

    const shouldRemoveParticipants = users.filter(({ bVideoOn }) => !bVideoOn);

    const shouldAddedParticipants = shouldRenderParticipants.filter(
      ({ userId }) => this._renderedList.findIndex(({ userId: renderedId }) => userId === renderedId) === -1,
    );

    shouldAddedParticipants.forEach(async (user) => {
      const { userId, displayName } = user;
      const canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
      if (canvas) {
        await this._stream?.renderVideo(canvas, userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_180P);
      }
    });

    if (shouldRemoveParticipants.length) {
      shouldRemoveParticipants.forEach(async (user) => {
        const { userId, displayName } = user;
        const canvas = document.getElementById(`${displayName}__sub`) as HTMLCanvasElement;
        if (canvas) {
          await this._stream?.stopRenderVideo(canvas, userId);
        }
      });
    }

    this._renderedList = shouldRenderParticipants;
  };

  peerVideoStateChange = async (payload: { action: "Start" | "Stop"; userId: number }) => {
    const { action, userId } = payload;
    const user = this.client.getUser(userId);
    if (!user) return;
    const isRendered = this._renderedList.find(({ userId: renderedId }) => userId === renderedId);

    const canvas = document.getElementById(`${user?.displayName}__sub`) as HTMLCanvasElement;
    if (canvas) {
      if (action === "Start" && !isRendered) {
        await this._stream?.renderVideo(canvas, user.userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_180P);
        this._renderedList.push(user);
      }
      if (action === "Stop") {
        await this._stream?.stopRenderVideo(canvas, userId);
        this._renderedList = this._renderedList.filter(({ userId: renderedId }) => userId === renderedId);
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

      this.registerListener()

      await this.renderPeerVideos();
    } catch (error) {
      this.joined = false;
    }
    this.inprogress = false;
  }

  async stopAudio() {
    try {
      await this._stream?.stopAudio();
    } catch (error) {
      Logger.error(error);
    }
  }

  async startAudio() {
    try {
      await this._stream?.startAudio();
      if (this._selectedMicrophoneId) {
        await this._stream?.switchMicrophone(this._selectedMicrophoneId);
      }
      await this.delay(200);
      if (!this.isMicEnable) {
        await this._stream?.muteAudio();
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
	this._client?.on("peer-video-state-change", this.peerVideoStateChange);

  }

  removeListener() {
	try {
		Logger.log("Remove all listener");
		this._client?.off("connection-change", this.onConnectionChange);
		this._client?.off("user-added", this.userAdded);
		this._client?.off("user-updated", this.userUpdated);
		this._client?.off("user-removed", this.userRemoved);
		this._client?.off("peer-video-state-change", this.peerVideoStateChange);
	} catch (error) {
		Logger.error(error)
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
	if(this.isCameraEnable === options.enable) return
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
        await this._stream?.startVideo({videoElement: video, ...this._defaultCaptureVideoOption });
        this.isCameraEnable = true;
      } else {
        Logger.log("Cannot find local user canvas");
      }
    } catch (error) {
		
      Logger.error(error);
    }
  }

  async proactiveDisableVideos(id?: string) {
    try {
      if (!id) return;
      const { role } = this.option.user;
      if (this.isCameraEnable && role === "host") {
        Logger.log("Turn off my video");
        await store.dispatch("teacherRoom/setTeacherVideo", {
          id: id,
          enable: false,
        });
      }
      if (role === "host") {
        await store.dispatch("teacherRoom/hideAllStudents");
      }
	  await this.delay(200)
    } catch (error) {
      Logger.error(error);
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

  async rejoinRTCRoom(options: { studentId?: string; teacherId?: string; token?: string; channel: string }) {
	const isBackToMainRoom = !options.token
    try {
      if (!this._client) return;

      Logger.log("Rejoin RTC room: ", options);
      await this.proactiveDisableVideos(options.studentId ?? options.teacherId);
	  await this.stopAudio();
	  this.removeListener()
	  await this.leaveSessionForOneToOne(isBackToMainRoom);
      await this._client?.join(options.channel, options.token || this.option.user.token, this.option.user.username);
      await this.startAudio();
      this.registerListener()
    } catch (error) {
      Logger.error(error);
    }
  }

  async teacherBreakoutRoom() {
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

  delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async teacherBackToMainRoom() {
    const { role, username, channel } = this.option.user;
    if (role !== "host") return;
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
      this._oneToOneStudentId = undefined;
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

  async reset(end = false) {
    Logger.log("Reset");
    this.isCameraEnable = false;
    this.isMicEnable = false;
    this.removeListener();
	if(this.isCameraEnable){
		await this._stream?.stopVideo();
	}
	if(this.isMicEnable){
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
  }
}
