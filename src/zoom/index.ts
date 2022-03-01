import ZoomVideo, { ConnectionState, Stream, VideoClient } from "@zoom/videosdk";
import { generateVideoToken } from "./util";
import { Logger } from "@/utils/logger";

export interface ZoomClientSDK {
  client: typeof VideoClient;
  joinRTCRoom(): void;
}

export interface ZoomClientOptions {
  key: string;
  secret: string;
  topic: string;
  name: string;
}

export class ZoomClient implements ZoomClientSDK {
  _client?: typeof VideoClient;
  _stream?: typeof Stream;
  _session?: string;
  _options: ZoomClientOptions;

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;

  constructor(options: ZoomClientOptions) {
    this._options = options;
  }

  get client() {
    return this._client as typeof VideoClient;
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

  async joinRTCRoom() {
    if (this._client || this.joined) return;
    this._client = this.zoomRTC.createClient();
    await this._client.init("en-US", "Global");

    this.client.on("connection-change", payload => {
      if (payload.state === ConnectionState.Connected) {
        Logger.log("connection-change", ConnectionState.Connected);
      } else if (payload.state === ConnectionState.Reconnecting) {
        Logger.log("connection-change", ConnectionState.Reconnecting);
      }
    });
    this.client.on("user-added", payload => {
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

    const token = generateVideoToken(this.option.key, this.option.secret, this.option.topic);
    await this.client.join(this.option.topic, token, this.option.name);
    this._stream = this.client.getMediaStream();
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
      await this.stream.startVideo();
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
