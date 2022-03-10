import ZoomVideo, { ConnectionState, LocalAudioTrack, LocalVideoTrack, Stream, VideoClient, VideoQuality } from "@zoom/videosdk";
import { Logger } from "@/utils/logger";

export interface ZoomClientSDK {
  client: typeof VideoClient;
  joinRTCRoom(options: { camera?: boolean; videoEncoderConfigurationPreset?: string; microphone?: boolean }): void;
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
  _videoElement?: HTMLVideoElement;
  _selfId?: number;
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

  async joinRTCRoom(options: {
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    videoEncoderConfigurationPreset?: string;
    microphone?: boolean;
  }) {
    if (this._client || this.joined) return;
    this._client = this.zoomRTC.createClient();
    await this.client.init("en-US", "Global");
    await this.client.join(this.option.user.channel, this.option.user.token, this.option.user.username);
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

    if (options.microphone) {
      await this.stream.startAudio();
    }

    const users = this.client.getAllUser();
    users.forEach(async user => {
      if (!user.bVideoOn) return;
      const canvas = document.getElementById(`${user?.displayName}__sub`) as HTMLCanvasElement;
      await this.stream.renderVideo(canvas, user.userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
    });
    this.client.on("connection-change", payload => {
      if (payload.state === ConnectionState.Connected) {
        Logger.log("connection-change", ConnectionState.Connected);
      } else if (payload.state === ConnectionState.Reconnecting) {
        Logger.log("connection-change", ConnectionState.Reconnecting);
      }
    });
    this.client.on("user-added", async payload => {
      payload.map(user => {
        Logger.log("user-added", user.userId);
      });
    });
    this.client.on("user-updated", payload => {
      payload.map(user => {
        Logger.log("user-updated", user.userId);
      });
    });
    this.client.on("user-removed", payload => {
      payload.map(user => {
        Logger.log("user-removed", user.userId);
      });
    });
    this.client.on("peer-video-state-change", async (payload: { action: "Start" | "Stop"; userId: number }) => {
      const { action, userId } = payload;
      const userAdded = this.client.getAllUser().find(user => user.userId === userId);
      const canvas = document.getElementById(`${userAdded?.displayName}__sub`) as HTMLCanvasElement;
      if (!canvas) return;
      if (action === "Start") {
        await this.stream.renderVideo(canvas, userId, canvas.width, canvas.height, 0, 0, VideoQuality.Video_360P);
      } else if (action === "Stop") {
        await this.stream.stopRenderVideo(canvas, userId);
        await this.stream.clearVideoCanvas(canvas);
      }
    });
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

  async reset() {
    await this._client?.leave();
    this.joined = false;

    this._stream = undefined;
    this._client = undefined;
  }
}
