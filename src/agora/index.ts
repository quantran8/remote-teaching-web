import { Logger } from "@/utils/logger";
import AgoraRTC, {
  ClientConfig,
  ConnectionDisconnectedReason,
  ConnectionState,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { AGORA_APP_TOKEN } from "./agora.config";
import { AgoraRoomApi } from "./services/agora-room.service";

export interface AgoraClientSDK {
  appId: string;
  appCertificate: string;
  client: IAgoraRTCClient;
  initClient(): void;
  initStream(): void;
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

export class AgoraClient implements AgoraClientSDK {
  _client?: IAgoraRTCClient;
  _api?: AgoraRoomApi;
  _config?: ClientConfig;
  _appId: string;
  _appCertificate: string;
  _options: AgoraClientOptions;
  _cameraTrack?: ICameraVideoTrack;
  _microphoneTrack?: IMicrophoneAudioTrack;
  streamUUID: string;
  get cameraTrack(): ICameraVideoTrack {
    return this._cameraTrack as ICameraVideoTrack;
  }
  get microphoneTrack(): IMicrophoneAudioTrack {
    return this._microphoneTrack as IMicrophoneAudioTrack;
  }
  get options(): AgoraClientOptions {
    return this._options as AgoraClientOptions;
  }
  get user(): AgoraUser {
    return this._options.user as AgoraUser;
  }
  get roomApi(): AgoraRoomApi {
    return this._api as AgoraRoomApi;
  }

  get client(): IAgoraRTCClient {
    return this._client as IAgoraRTCClient;
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
  get agoraRTC(): IAgoraRTC {
    return AgoraRTC;
  }
  constructor(options: AgoraClientOptions) {
    this._options = options;
    this._config = options.webConfig;
    this._appId = options.appId;
    this._appCertificate = options.appCertificate;
    this._api = new AgoraRoomApi();
    this.streamUUID = "";
  }
  joined: boolean = false;
  publishedVideo: boolean = false;
  publishedAudio: boolean = false;

  async initClient() {
    if (this._client) return;
    this._client = this.agoraRTC.createClient(this.clientConfig);

    // const entryRoomData = await this.roomApi.entry(
    //   this.user.channel,
    //   this.user.username,
    //   AGORA_APP_TOKEN,
    //   "0",
    //   this.user.role
    // );
    // this.streamUUID = entryRoomData.data.user.streamUuid;

    // const streams = get(entryRoomData, "user.streams", []);
    // console.log("Entry Room Data");
    // console.log(streams);

    const responseJoinChannel = await this.client.join(
      this.appId,
      this.user.channel,
      AGORA_APP_TOKEN,
      this.user.username
    );
    console.log("ResponseJoinChannel", responseJoinChannel);

    this.joined = true;

    // Create a video track from the video captured by a camera.
    const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await this.client.publish([localVideoTrack, localAudioTrack]);
    localVideoTrack.play("userStreamID");

    this.client.on("user-joined", (payload) => {
      console.log("user-joined", payload);
    });

    this.client.on("user-info-updated", (payload) => {
      console.log("user-info-updated", payload);
    });
    this.client.on("user-published", async (user, mediaType) => {
      // Initiate the subscription
      // await this.client.subscribe(user, mediaType);

      // // If the subscribed track is an audio track
      // if (mediaType === "audio") {
      //   const audioTrack = user.audioTrack;
      //   // Play the audio
      //   audioTrack?.play();
      // } else {
      //   const videoTrack = user.videoTrack;
      //   // Play the video
      //   // videoTrack?.play("userStreamID");
      //   console.log("videoTrack", videoTrack);
      // }
      if (mediaType === "video") {
        const videoTrack = await this.client.subscribe(
          this.client.remoteUsers[0],
          "video"
        );
        console.log("VideoTrack", videoTrack);
        videoTrack.play("userStream1");
      }
    });
    // this.client.on(
    //   "user-published",
    //   async (user: IAgoraRTCRemoteUser, mediaType) => {
    //     console.log("user-published", user, mediaType);
    //     try {
    //       await this.client.subscribe(user, mediaType);
    //     } catch (error) {
    //       console.log("Error", error);
    //     }
    //   }
    // );
    this.client.on(
      "connection-state-change",
      (
        curState: ConnectionState,
        revState: ConnectionState,
        reason?: ConnectionDisconnectedReason
      ) => {
        console.log("connection-state-change", curState, revState, reason);
      }
    );
  }

  streams: Array<string> = [];

  async openCamera(): Promise<any> {
    Logger.info("[agora-web] invoke web#openCamera");
    this._cameraTrack = await this.agoraRTC.createCameraVideoTrack();
    this.cameraTrack.on("track-ended", () => {
      this.cameraTrack && this.closeMediaTrack(this.cameraTrack);
    });
    Logger.info(
      `[agora-web] create default camera [${this.cameraTrack.getTrackId()}] video track success`
    );

    if (this.joined && !this.publishedVideo) {
      const cameraId = this.cameraTrack.getTrackId();
      await this.client.publish([this.cameraTrack]);
      this.publishedVideo = true;
      Logger.info(`[agora-web] publish camera [${cameraId}] success`);
    }
  }

  private closeMediaTrack(track: ILocalTrack) {
    if (track) {
      track.stop();
      track.close();
    }
    if (track.trackMediaType === "video") {
      this._cameraTrack = undefined;
    }
    if (track.trackMediaType === "audio") {
      // this.closeInterval('volume')
      this._microphoneTrack = undefined;
    }
  }

  publishedTrackIds: any[] = [];
  async publish(): Promise<any> {
    if (this.cameraTrack) {
      const trackId = this.cameraTrack.getTrackId();
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.cameraTrack]);
        this.publishedVideo = true;
        this.publishedTrackIds.push(trackId);
      }
    }
    if (this.microphoneTrack) {
      const trackId = this.microphoneTrack.getTrackId();
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.microphoneTrack]);
        this.publishedAudio = true;
        this.publishedTrackIds.push(trackId);
      }
    }
  }

  async initStream() {
    await this.openCamera();
    this.cameraTrack.play("userStreamID");
    console.log("remoteUsers", this.client.remoteUsers);
  }

  reset() {
    this.publishedVideo = false;
    this.publishedAudio = false;
    // this.localUid = undefined
    // this.releaseAllClient()
    //  this.clearAllInterval()
    this.cameraTrack && this.closeMediaTrack(this.cameraTrack);
    this.microphoneTrack && this.closeMediaTrack(this.microphoneTrack);
    // this.cameraTestTrack && this.closeTestTrack(this.cameraTestTrack)
    //  this.microphoneTestTrack && this.closeTestTrack(this.microphoneTestTrack)
    //  this.screenVideoTrack && this.closeScreenTrack(this.screenVideoTrack)
    //  this.screenAudioTrack && this.closeScreenTrack(this.screenAudioTrack)
    this.joined = false;
    this.publishedTrackIds = [];
    // this.deviceList = []
    // this.subscribeVideoList = []
    // this.subscribeAudioList = []
    // this.unsubscribeAudioList = []
    // this.unsubscribeVideoList = []
    // this.videoMuted = false
    // this.audioMuted = false
    // this.channelName = ''
    // this.init()
  }
}
