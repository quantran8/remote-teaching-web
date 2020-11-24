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

export interface AgoraClientOptions {
  appId: string;
  appCertificate: string;
  webConfig: ClientConfig;
  user?: {
    channel: string;
    username: string;
    role: "host" | "audience";
  };
}

export class AgoraClient implements AgoraClientSDK {
  _client?: Client;
  _api?: AgoraRoomApi;
  _stream?: Stream;
  _config?: ClientConfig;
  _appId: string;
  _appCertificate: string;
  streamUUID: string;
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
    this._config = options.webConfig;
    this._appId = options.appId;
    this._appCertificate = options.appCertificate;
    this._api = new AgoraRoomApi();
    this.streamUUID = "";
  }

  async initClient() {
    if (this._client) return;
    this._client = createClient(this.clientConfig);
    const roomName = "remoteteaching";
    const fetchRoomData = await this.roomApi.fetchRoom({
      roomName: roomName,
    });
    console.log("RoomData", fetchRoomData);
    const { roomUuid } = fetchRoomData;
    console.log("InitClient", this._client);
    const token = AGORA_APP_TOKEN;
    const channel = roomName;
    const uid = "teacher1";
    const res = await this.roomApi.login(uid);
    console.log("LoggedIn", res);
    const entryRoom = await this.roomApi.entry(
      roomName,
      uid,
      token,
      "0",
      false
    );
    console.log("EntryRoom", entryRoom);
    const rtcToken = entryRoom.data.user.rtcToken;
    this.streamUUID = entryRoom.data.user.streamUuid;
    console.log("Start Join RTC");
    this.client.join(
      rtcToken,
      channel,
      uid,
      (successData) => {
        console.log("Joinned", successData);
      },
      (errData) => {
        console.log("Error", errData);
      }
    );
    this.client.on("stream-added", (event) => {
      console.log("ON Stream Added", event);
    });
  }

  initStream() {
    if (this._stream) return;
    console.log("StreamUUID", this.streamUUID);
    const spec: StreamSpec = {
      streamID: this.streamUUID,
      audio: true,
      video: true,
    };
    this._stream = createStream(spec);
    this.stream.init(
      () => {
        console.log("Init Stream success");
        this.stream.play("userStreamID");
      },
      (err) => {
        console.log("Init Stream error", err);
      }
    );
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
