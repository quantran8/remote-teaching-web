import ZoomVideo, { ConnectionState, Stream, VideoClient, VideoQuality, ConnectionChangePayload, ParticipantPropertiesPayload } from "@zoom/videosdk";
import { Logger } from "@/utils/logger";
import { generateVideoToken } from "./utils";

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
  platformUserId: string;
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
  _videoElement?: HTMLVideoElement;
  _selfId?: number;
  _oneToOneStudentId?: string;
  joined = false;
  isMicEnable = false;
  isCameraEnable = false;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._usersAdded = [];
  }

  get client() {
    return this._client as typeof VideoClient;
  }

  get videoElement() {
    return this._videoElement as HTMLVideoElement;
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

  onConnectionChange = (payload: ConnectionChangePayload) => {
    if (payload.state === ConnectionState.Connected) {
      Logger.log("connection-change", ConnectionState.Connected);
    } else if (payload.state === ConnectionState.Reconnecting) {
      Logger.log("connection-change", ConnectionState.Reconnecting);
    }
  };

  userAdded = (payload: ParticipantPropertiesPayload[]) => {
    payload.map(user => {
      Logger.log("user-added", user.userId);
    });
  };

  userUpdated = (payload: ParticipantPropertiesPayload[]) => {
    payload.map(user => {
      Logger.log("user-updated", user.userId);
    });
  };

  userRemoved = (payload: ParticipantPropertiesPayload[]) => {
    payload.map(user => {
      Logger.log("user-removed", user.userId);
    });
  };

  peerVideoStateChange = async (payload: { action: "Start" | "Stop"; userId: number }) => {
    const { action, userId } = payload;
    const userAdded = this.client.getAllUser().find(user => user.userId === userId);
    const canvas = document.getElementById(`${userAdded?.displayName}__sub`) as HTMLCanvasElement;
    if (!canvas) return;
    if (action === "Start") {
      await this.stream.renderVideo(canvas, userId, 300, canvas.height, 0, 0, VideoQuality.Video_720P);
    } else if (action === "Stop") {
      await this.stream.stopRenderVideo(canvas, userId);
      await this.stream.clearVideoCanvas(canvas);
    }
  };

  async joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
    token?: string;
	isRejoin?: boolean;
  }) {
    try {
      this.isMicEnable = !!options.microphone;
      this.isCameraEnable = !!options.camera;

      this._client = this.zoomRTC.createClient();
      await this.client.init("en-US", "Global");
      let channelName = this.option.user.channel;
      if (options.token) {
        channelName += "-one-to-one";
      }
      await this.client.join(channelName, options.token || this.option.user.token, this.option.user.username);
      this._selfId = this.client.getSessionInfo().userId;
      this._stream = this.client.getMediaStream();

      this.joined = true;
      if (options.microphone) {
        await this.stream.startAudio();
      }
      this._videoElement = document.getElementById((options.teacherId || options.studentId) + "__video") as HTMLVideoElement;
      if (options.camera) {
        await this.stream.startVideo({ videoElement: this._videoElement });
      }
      const users = this.client.getAllUser();
      users.forEach(async user => {
        if (!user.bVideoOn) return;
        const canvas = document.getElementById(`${user?.displayName}__sub`) as HTMLCanvasElement;
        await this.stream.renderVideo(canvas, user.userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
      });
	  if(!options.isRejoin){
		this.client.on("connection-change", this.onConnectionChange);
		this.client.on("user-added", this.userAdded);
		this.client.on("user-updated", this.userUpdated);
		this.client.on("user-removed", this.userRemoved);
		this.client.on("peer-video-state-change", this.peerVideoStateChange);
	  }
    } catch (error) {
      console.log(error);
    }
  }

  removeListener() {
    this.client?.off("connection-change", this.onConnectionChange);
    this.client?.off("user-added", this.userAdded);
    this.client?.off("user-updated", this.userUpdated);
    this.client?.off("user-removed", this.userRemoved);
    this.client?.off("peer-video-state-change", this.peerVideoStateChange);
  }

  async setMicrophone(options: { enable: boolean }) {
    this.isMicEnable = options.enable;
    if (this.isMicEnable) {
      await this.stream.startAudio();
    } else {
      await this.stream.stopAudio();
    }
  }

  async setCamera(options: { enable: boolean }) {
    this.isCameraEnable = options.enable;
    if (this.isCameraEnable) {
      await this.stream.startVideo({ videoElement: this._videoElement });
    } else {
      await this.stream.stopVideo();
    }
  }

  async teacherBreakoutRoom() {
    if (this.option.user.role !== "host") return;
    try {
      await this.client.leave();
      const token = generateVideoToken(this.option.user.channel + "-one-to-one", 1);
      await this.joinRTCRoom({
        teacherId: this.option.user.username,
        camera: this.isCameraEnable,
        microphone: this.isMicEnable,
        token,
		isRejoin: true,
      });
      this.getSessionInfo("Teacher back to main room: ");
    } catch (error) {
      console.log(error);
    }
  }

  delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async teacherBackToMainRoom() {
    if (this.option.user.role !== "host") return;
    try {
	  await this.client.leave();
      await this.joinRTCRoom({
        teacherId: this.option.user.username,
        camera: this.isCameraEnable,
        microphone: this.isMicEnable,
		isRejoin: true,
      });
      this.getSessionInfo("Teacher breakout room: ");
    } catch (error) {
      console.log(error);
    }
  }

  getSessionInfo(from = "") {
    console.log(this.client?.getAllUser());
    console.log(from + this.client?.getSessionInfo().topic);
  }

  async breakoutRoomOrBackToMainRoom(id?: string) {
    if (this.option.user.role === "host") return;
    try {
      if (id) {
        if (this.option.user.username === id) {
          console.log("Breakout room", id);
          this._oneToOneStudentId = id;
          await this.client.leave();
          const token = generateVideoToken(this.option.user.channel + "-one-to-one", 0);
          await this.joinRTCRoom({
            studentId: this.option.user.username,
            camera: this.isCameraEnable,
            microphone: this.isMicEnable,
            token,
          });
          this.getSessionInfo("Student breakout room: ");
        }
      } else {
        if (this.option.user.username === this._oneToOneStudentId) {
          console.log("Back to class room");
          this._oneToOneStudentId = undefined;
          await this.client.leave();
          await this.joinRTCRoom({
            studentId: this.option.user.username,
            camera: this.isCameraEnable,
            microphone: this.isMicEnable,
          });
          this.getSessionInfo("Student back to main room: ");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async reset() {
    this.removeListener();

    const allUsers = this.client.getAllUser();
    for (let index = 0; index < allUsers.length; index++) {
      const targetUser = allUsers[index];
      const canvas = document.getElementById(`${targetUser.displayName}__sub`) as HTMLCanvasElement;
      if (canvas) {
        await this.stream.stopRenderVideo(canvas, targetUser.userId);
        await this.stream.clearVideoCanvas(canvas);
      }
    }

    await this.client.leave(false);
    this.joined = false;
    this._stream = undefined;
    this._client = undefined;
  }
}
