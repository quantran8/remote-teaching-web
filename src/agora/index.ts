import {
  Client,
  ClientConfig,
  createClient,
  createStream,
  getDevices,
  Stream,
  StreamSpec,
} from "agora-rtc-sdk";
import { reject } from "lodash";
import {
  AGORA_APP_CERTIFICATE,
  AGORA_APP_ID,
  AGORA_APP_TOKEN,
} from "./agora.config";
import { AgoraRoomApi } from "./services/agora-room.service";

export interface AgoraClientSDK {
  appId: string;
  appCertificate: string;
  stream: Stream;
  client: Client;
  initClient(): void;
  initStream(): void;
  getCameras(): Promise<Array<AgoraRTC.MediaDeviceInfo>>;
  getDevices(): Promise<Array<AgoraRTC.MediaDeviceInfo>>;
}

export interface AgoraUser {
  channel: string;
  username: string;
  role: "host" | "audience";
}

export interface AgoraClientOptions {
  appId: string;
  appCertificate: string;
  webConfig: ClientConfig;
  user?: AgoraUser;
}

export type AgoraClientEvent =
  | "first-audio-frame-decode"
  | "first-video-frame-decode"
  | "stream-published"
  | "stream-unpublished"
  | "stream-added"
  | "stream-removed"
  | "stream-subscribed"
  | "peer-online"
  | "peer-leave"
  | "mute-audio"
  | "unmute-audio"
  | "mute-video"
  | "unmute-video"
  | "crypt-error"
  | "client-banned"
  | "active-speaker"
  | "volume-indicator"
  | "liveStreamingStarted"
  | "liveStreamingFailed"
  | "liveStreamingStopped"
  | "liveTranscodingUpdated"
  | "streamInjectedStatus"
  | "onTokenPrivilegeWillExpire"
  | "onTokenPrivilegeDidExpire"
  | "error"
  | "network-type-changed"
  | "recording-device-changed"
  | "playout-device-changed"
  | "camera-changed"
  | "stream-type-changed"
  | "connection-state-change"
  | "stream-reconnect-start"
  | "stream-reconnect-end"
  | "client-role-changed"
  | "reconnect"
  | "connected"
  // | "network-quality"
  | "stream-fallback"
  | "stream-updated"
  | "exception"
  | "enable-local-video"
  | "disable-local-video"
  | "channel-media-relay-event"
  | "channel-media-relay-state";

export const AgoraClientEvents: Array<AgoraClientEvent> = [
  "first-audio-frame-decode",
  "first-video-frame-decode",
  "stream-published",
  "stream-unpublished",
  "stream-added",
  "stream-removed",
  "stream-subscribed",
  "peer-online",
  "peer-leave",
  "mute-audio",
  "unmute-audio",
  "mute-video",
  "unmute-video",
  "crypt-error",
  "client-banned",
  "active-speaker",
  "volume-indicator",
  "liveStreamingStarted",
  "liveStreamingFailed",
  "liveStreamingStopped",
  "liveTranscodingUpdated",
  "streamInjectedStatus",
  "onTokenPrivilegeWillExpire",
  "onTokenPrivilegeDidExpire",
  "error",
  "network-type-changed",
  "recording-device-changed",
  "playout-device-changed",
  "camera-changed",
  "stream-type-changed",
  "connection-state-change",
  "stream-reconnect-start",
  "stream-reconnect-end",
  "client-role-changed",
  "reconnect",
  "connected",
  // "network-quality",
  "stream-fallback",
  "stream-updated",
  "exception",
  "enable-local-video",
  "disable-local-video",
  "channel-media-relay-event",
  "channel-media-relay-state",
];
export class AgoraClient implements AgoraClientSDK {
  _client?: Client;
  _api?: AgoraRoomApi;
  _stream?: Stream;
  _config?: ClientConfig;
  _appId: string;
  _appCertificate: string;
  _options: AgoraClientOptions;
  streamUUID: string;
  get options(): AgoraClientOptions {
    return this._options as AgoraClientOptions;
  }
  get user(): AgoraUser {
    return this._options.user as AgoraUser;
  }
  get roomApi(): AgoraRoomApi {
    return this._api as AgoraRoomApi;
  }
  get stream(): Stream {
    return this._stream as Stream;
  }
  get client(): Client {
    return this._client as Client;
  }
  get clientId(): string {
    return (this._client as any).clientId;
  }
  get clientConfig(): ClientConfig {
    return this._config as ClientConfig;
  }
  get appId(): string {
    return this._appId;
  }
  get appCertificate(): string {
    return this._appCertificate;
  }

  constructor(options: AgoraClientOptions) {
    this._options = options;
    this._config = options.webConfig;
    this._appId = options.appId;
    this._appCertificate = options.appCertificate;
    this._api = new AgoraRoomApi();
    this.streamUUID = "";
  }

  async initClient() {
    if (this._client) return;
    this._client = createClient(this.clientConfig);
    this.client.init(
      this.options.appId,
      () => {
        console.log("InitClient Success");
        //      const fetchRoomData = await this.roomApi.fetchRoom({
        //   roomName: this.user.channel,
        // });
        // console.log("RoomData", fetchRoomData);

        this.client.join(
          AGORA_APP_TOKEN,
          this.user.channel,
          this.user.username,
          async (successData) => {
            console.log("Joinned", successData);
            const entryRoom = await this.roomApi.entry(
              this.user.channel,
              this.user.username,
              AGORA_APP_TOKEN,
              "0",
              this.user.role
            );
            this.streamUUID = entryRoom.data.user.streamUuid;
            console.log(this.streamUUID);
          },
          (errData) => {
            console.log("Error", errData);
          }
        );
      },
      (err) => {
        console.log("InitClient Error", err);
      }
    );
    // const fetchRoomData = await this.roomApi.fetchRoom({
    //   roomName: this.user.channel,
    // });
    // console.log("RoomData", fetchRoomData);
    // const { roomUuid } = fetchRoomData;
    // console.log("InitClient", this._client);
    // // const res = await this.roomApi.login(this.user.username);
    // // console.log("LoggedIn", res);
    // const entryRoom = await this.roomApi.entry(
    //   this.user.channel,
    //   this.user.username,
    //   "",
    //   "0",
    //   this.user.role
    // );
    // const rtcToken = entryRoom.data.user.rtcToken;
    // this.streamUUID = entryRoom.data.user.streamUuid;
    // console.log("Start Join RTC");
    // this.client.join(
    //   rtcToken,
    //   this.user.channel,
    //   this.user.username,
    //   (successData) => {
    //     console.log("Joinned", successData);
    //   },
    //   (errData) => {
    //     console.log("Error", errData);
    //   }
    // );

    // this.client.on("stream-added", (event) => {
    //   console.log("ON Stream Added", event);
    // });
    // this.client.on("peer-online", (event) => {
    //   console.log("ON peer-online", event);
    // });
    // this.client.on("peer-leave", (event) => {
    //   console.log("ON peer-leave", event);
    // });
    // this.client.on("stream-published", (event) => {});

    for (let event of AgoraClientEvents) {
      this.client.on(event as any, (data) => {
        console.log(event, data);
        if (event === "stream-added") {
          const stream: Stream = data.stream as AgoraRTC.Stream;
          const streamID = stream.getId() + "";
          console.log("StreamID", streamID);
          if (this.streams.indexOf(streamID) === -1) {
            this.streams.push(streamID);
            stream.play(
              "userStream" + this.streams.length,
              { fit: "cover" },
              (errx: any) => {
                console.log("PlayerOtherUserStream", errx);
              }
            );
          }
        }
      });
    }
  }

  streams: Array<string> = [];

  initStream() {
    if (this._stream) return;
    const spec: StreamSpec = {
      streamID: this.streamUUID,
      audio: true,
      video: true,
    };
    this._stream = createStream(spec);
    this.stream.init(
      () => {
        console.log("Init Stream success");
        this.stream.play("userStreamID", { fit: "cover" }, (err) => {
          console.log("PlayerUserStream", err);
        });
        this.client.publish(this.stream, (error) => {
          console.log("Publish Stream Error", error);
        });
      },
      (err) => {
        console.log("Init Stream error", err);
      }
    );
    this.stream.on("player-status-change", (evt) => {
      console.log("player-status-change", evt);
    });
  }
  _cameras: Array<AgoraRTC.MediaDeviceInfo> = [];
  getCameras(): Promise<Array<AgoraRTC.MediaDeviceInfo>> {
    return new Promise((resolve) => {
      try {
        this.client.getCameras((cameras) => {
          this._cameras = cameras;
          resolve(cameras);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  _devices: Array<AgoraRTC.MediaDeviceInfo> = [];
  getDevices(): Promise<Array<AgoraRTC.MediaDeviceInfo>> {
    return new Promise((resolve) => {
      try {
        getDevices((devices) => {
          this._devices = devices;
          resolve(devices);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const AgoraClientSDK: AgoraClientSDK = new AgoraClient({
  appId: AGORA_APP_ID,
  appCertificate: AGORA_APP_CERTIFICATE,
  webConfig: {
    mode: "rtc",
    codec: "vp8",
  },
});
