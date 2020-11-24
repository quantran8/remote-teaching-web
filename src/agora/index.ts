import {
  Client,
  ClientConfig,
  createClient,
  createStream,
  Stream,
  StreamSpec,
} from "agora-rtc-sdk";
import {
  AGORA_APP_CERTIFICATE,
  AGORA_APP_ID,
  AGORA_APP_TOKEN,
} from "./agora.config";
import { AgoraRoomApi } from "./services/agora-room.service";

export interface AgoraClientSDK {
  appId: string;
  appCertificate: string;
  initClient(): void;
  initStream(): void;
  stream: Stream;
  client: Client;
}

export interface AgoraClientOptions {
  appId: string;
  appCertificate: string;
  webConfig: ClientConfig;
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

  // initClient() {
  //   if (this._client) return;
  //   this._client = createClient(this.clientConfig);
  //   console.log("InitClient", this._client);
  //   this.client.on("stream-added", (event) => {
  //     console.log("ON Stream Added", event);
  //   });

  //   // const params = {
  //   //   channel: "RemoteTeaching",
  //   //   token: "",
  //   //   uid: this.clientId,
  //   //   info: "",
  //   // };
  //   // this._client.join(
  //   //   params.token,
  //   //   params.channel,
  //   //   params.uid,
  //   //   (onSuccess) => {
  //   //     console.log("On JOIN Success", onSuccess);
  //   //   },
  //   //   (onFailure) => {
  //   //     console.log("On JOIN Failure", onFailure);
  //   //   }
  //   // );
  //   // fetch(
  //   //   "https://api.agora.io/scene/apps/da2d4c42cea04e30973bd4d6800dd468/v1/rooms/RemoteTeaching1/config",
  //   //   {
  //   //     headers: {
  //   //       accept: "*/*",
  //   //       "accept-language": "en-US,en;q=0.9",
  //   //       authorization:
  //   //         "Basic ZjBjYTFlNTUzM2ZjNGYyMmIzOWE4ZmQ5NzA2MzRmMzk6OTI5OGJlZTgyZWEzNGEyMWFlNWI3ZmJhNzM3MTlmYjk=",
  //   //       "content-type": "application/json",
  //   //       "sec-fetch-dest": "empty",
  //   //       "sec-fetch-mode": "cors",
  //   //       "sec-fetch-site": "cross-site",
  //   //     },
  //   //     body: null,
  //   //     method: "GET",
  //   //     mode: "cors",
  //   //   }
  //   // ).then(res => res.json()).then(res => console.log("res",res));

  //   // get room info
  //   // fetch(
  //   //   "https://api.agora.io/scene/apps/da2d4c42cea04e30973bd4d6800dd468/v1/rooms/rtc1/config",
  //   //   {
  //   //     headers: {
  //   //       accept: "*/*",
  //   //       "accept-language": "en-US,en;q=0.9",
  //   //       authorization:
  //   //         "Basic ZjBjYTFlNTUzM2ZjNGYyMmIzOWE4ZmQ5NzA2MzRmMzk6OTI5OGJlZTgyZWEzNGEyMWFlNWI3ZmJhNzM3MTlmYjk=",
  //   //       "content-type": "application/json",
  //   //       "sec-fetch-dest": "empty",
  //   //       "sec-fetch-mode": "cors",
  //   //       "sec-fetch-site": "cross-site",
  //   //     },
  //   //     referrer: "http://127.0.0.1:3001/",
  //   //     referrerPolicy: "strict-origin-when-cross-origin",
  //   //     body: null,
  //   //     method: "GET",
  //   //     mode: "cors",
  //   //   }
  //   // );
  //   // const response1 = {
  //   //   msg: "Success",
  //   //   code: 0,
  //   //   ts: 1605865758213,
  //   //   data: {
  //   //     roomName: "rtc",
  //   //     roomUuid: "rtc1",
  //   //     roleConfig: {
  //   //       broadcaster: { limit: 16, verifyType: 0, subscribe: 1 },
  //   //       host: { limit: 1, verifyType: 0, subscribe: 1 },
  //   //     },
  //   //     roomProperties: {
  //   //       board: { state: { grantUsers: [], follow: 0 }, info: {} },
  //   //     },
  //   //   },
  //   // };

  //   // // 2. Login to the room
  //   // fetch(
  //   //   "https://api.agora.io/scene/apps/da2d4c42cea04e30973bd4d6800dd468/v1/users/stdstudent/login",
  //   //   {
  //   //     headers: {
  //   //       accept: "*/*",
  //   //       "accept-language": "en-US,en;q=0.9",
  //   //       authorization:
  //   //         "Basic ZjBjYTFlNTUzM2ZjNGYyMmIzOWE4ZmQ5NzA2MzRmMzk6OTI5OGJlZTgyZWEzNGEyMWFlNWI3ZmJhNzM3MTlmYjk=",
  //   //       "content-type": "application/json",
  //   //       "sec-fetch-dest": "empty",
  //   //       "sec-fetch-mode": "cors",
  //   //       "sec-fetch-site": "cross-site",
  //   //     },
  //   //     referrer: "http://127.0.0.1:3001/",
  //   //     referrerPolicy: "strict-origin-when-cross-origin",
  //   //     body: "{}",
  //   //     method: "POST",
  //   //     mode: "cors",
  //   //   }
  //   // );
  //   // const response2 = {
  //   //   msg: "Success",
  //   //   code: 0,
  //   //   ts: 1605865758913,
  //   //   data: {
  //   //     userUuid: "stdstudent",
  //   //     rtmToken:
  //   //       "006da2d4c42cea04e30973bd4d6800dd468IAAlbM63DPCHdb3VPryjxjA70FhJYAYrHRWuIHQIgpi/7jgaVS0AAAAAIgAksI0CnuK4XwQAAQD/////AgD/////AwD/////BAD/////",
  //   //   },
  //   // };
  //   // // 3.

  //   // fetch("https://ap-web-1.agora.io/api/v1", {
  //   //   headers: {
  //   //     accept: "*/*",
  //   //     "accept-language": "en-US,en;q=0.9",
  //   //     "content-type": "application/json; charset=UTF-8 application/json",
  //   //     "sec-fetch-dest": "empty",
  //   //     "sec-fetch-mode": "cors",
  //   //     "sec-fetch-site": "cross-site",
  //   //     "x-packet-service-type": "0",
  //   //     "x-packet-uri": "69",
  //   //   },
  //   //   referrer: "http://127.0.0.1:3001/",
  //   //   referrerPolicy: "strict-origin-when-cross-origin",
  //   //   body:
  //   //     '{"flag":128,"opid":1,"key":"006da2d4c42cea04e30973bd4d6800dd468IAAlbM63DPCHdb3VPryjxjA70FhJYAYrHRWuIHQIgpi/7jgaVS0AAAAAIgAksI0CnuK4XwQAAQD/////AgD/////AwD/////BAD/////","cname":"stdstudent","detail":{},"uid":7943557522483270,"sid":"94717625633911142630000000000000"}',
  //   //   method: "POST",
  //   //   mode: "cors",
  //   // });
  //   // const response3 = {
  //   //   code: 0,
  //   //   flag: 128,
  //   //   opid: 1,
  //   //   cid: 3170897456,
  //   //   uid: 2623629382,
  //   //   server_ts: 1605865759543,
  //   //   cname: "stdstudent",
  //   //   addresses: [
  //   //     {
  //   //       ip: "164.52.53.199",
  //   //       port: 9130,
  //   //       ticket:
  //   //         "TmdBQUFBZ0E2WWtGQUVab1lad3dEZ0M5QXdBeHNnRUFOOW9CQURBRkFnQWZrYmRmLy8vLy93b0FjM1JrYzNSMVpHVnVkQUFBQUFBVUFQVTN1M0pNdWZOWmF4WXIxWVdsNEd6MEU2dWw=",
  //   //     },
  //   //     {
  //   //       ip: "164.52.51.50",
  //   //       port: 9130,
  //   //       ticket:
  //   //         "TmdBQUFBZ0E2WWtGQUVab1lad3dEZ0M5QXdBeHNnRUFOOW9CQURBRkFnQWZrYmRmLy8vLy93b0FjM1JrYzNSMVpHVnVkQUFBQUFBVUFQVTN1M0pNdWZOWmF4WXIxWVdsNEd6MEU2dWw=",
  //   //     },
  //   //     {
  //   //       ip: "164.52.0.52",
  //   //       port: 9130,
  //   //       ticket:
  //   //         "TmdBQUFBZ0E2WWtGQUVab1lad3dEZ0M5QXdBeHNnRUFOOW9CQURBRkFnQWZrYmRmLy8vLy93b0FjM1JrYzNSMVpHVnVkQUFBQUFBVUFQVTN1M0pNdWZOWmF4WXIxWVdsNEd6MEU2dWw=",
  //   //     },
  //   //   ],
  //   //   detail: {
  //   //     "1": "113.190.254.72",
  //   //     "2": "NA",
  //   //     "3": "VN",
  //   //     "4":
  //   //       "NOfLsHjrGMFPPD8gfAY0QqY95iNNdueqbDSXFITsBDvIaxkx2DDEVs2taAAXTYeXUPHKmfyDojrb2AH+HJc7bQ==",
  //   //     "8": "362985",
  //   //     "9": "SEA",
  //   //     "10":
  //   //       "006da2d4c42cea04e30973bd4d6800dd468IAAlbM63DPCHdb3VPryjxjA70FhJYAYrHRWuIHQIgpi/7jgaVS0AAAAAIgAksI0CnuK4XwQAAQD/////AgD/////AwD/////BAD/////",
  //   //   },
  //   // };

  //   // // 4. Entry
  //   // fetch(
  //   //   "https://api.agora.io/scene/apps/da2d4c42cea04e30973bd4d6800dd468/v1/rooms/rtc1/users/stdstudent/entry",
  //   //   {
  //   //     headers: {
  //   //       accept: "*/*",
  //   //       "accept-language": "en-US,en;q=0.9",
  //   //       authorization:
  //   //         "Basic ZjBjYTFlNTUzM2ZjNGYyMmIzOWE4ZmQ5NzA2MzRmMzk6OTI5OGJlZTgyZWEzNGEyMWFlNWI3ZmJhNzM3MTlmYjk=",
  //   //       "content-type": "application/json",
  //   //       "sec-fetch-dest": "empty",
  //   //       "sec-fetch-mode": "cors",
  //   //       "sec-fetch-site": "cross-site",
  //   //     },
  //   //     referrer: "http://127.0.0.1:3001/",
  //   //     referrerPolicy: "strict-origin-when-cross-origin",
  //   //     body: '{"userName":"std","role":"broadcaster","streamUuid":"0"}',
  //   //     method: "POST",
  //   //     mode: "cors",
  //   //   }
  //   // );
  //   // const response4 = {
  //   //   msg: "Success",
  //   //   code: 0,
  //   //   ts: 1605865760815,
  //   //   data: {
  //   //     room: {
  //   //       roomInfo: { roomName: "rtc", roomUuid: "rtc1" },
  //   //       roomState: { state: 0, muteChat: {}, muteVideo: {}, muteAudio: {} },
  //   //       roomProperties: {
  //   //         board: { info: {}, state: { follow: 0, grantUsers: [] } },
  //   //       },
  //   //     },
  //   //     user: {
  //   //       userName: "std",
  //   //       userUuid: "stdstudent",
  //   //       role: "broadcaster",
  //   //       muteChat: 0,
  //   //       userProperties: {},
  //   //       updateTime: 1605865760471,
  //   //       streamUuid: "2522179773",
  //   //       userToken:
  //   //         "eyJhbGciOiJIUzI1NiJ9.eyJwcmltYXJ5U3RyZWFtVXVpZCI6IjI1MjIxNzk3NzMiLCJhcHBJZCI6ImRhMmQ0YzQyY2VhMDRlMzA5NzNiZDRkNjgwMGRkNDY4IiwidXNlclV1aWQiOiJzdGRzdHVkZW50Iiwicm9vbVV1aWQiOiJydGMxIiwidXNlcklkIjoiNWZiNzkxMjAxODc0ODU2ZmIzNWRlODU0Iiwicm9vbUlkIjoiNWZiNzkwZmM4NGVlZTk0MDVjZjgxNTgxIiwiaWF0IjoxNjA1ODY1NzYwfQ.nZGIc1yvOpsJ8PDXCs8WVKV3Qpgy4GysFQIUHpQhIcI",
  //   //       rtmToken:
  //   //         "006da2d4c42cea04e30973bd4d6800dd468IACfz041Zr3UdVRXSwgv75ocWCpRYZL/cUj0LRdGywHitzgaVS0AAAAAIgAdyuMAoOK4XwQAAQD/////AgD/////AwD/////BAD/////",
  //   //       rtcToken:
  //   //         "006da2d4c42cea04e30973bd4d6800dd468IADfNzQHPYjCp25cFQL4mtqSSyvjosWcIcBPoX3gwdXk9NlPhKwXaslMIgDwIKQDoOK4XwQAAQD/////AgD/////AwD/////BAD/////",
  //   //       state: 2,
  //   //     },
  //   //     sysConfig: { sequenceTimeout: 300 },
  //   //   },
  //   // };
  // }

  async initClient() {
    if (this._client) return;
    this._client = createClient(this.clientConfig);
    const roomName = "remoteteaching";
    const fetchRoomData = await this.roomApi.fetchRoom({
      roomName: roomName,
    });
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
    console.log("StreamUUID", this.streamUUID)
    const spec: StreamSpec = {
      streamID: this.streamUUID,
      audio: true,
      video: true,
    };
    this._stream = createStream(spec);
    this._stream.play("userStreamID");
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
