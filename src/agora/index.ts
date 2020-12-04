import AgoraRTC, {
  ClientConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

export interface AgoraClientSDK {
  appId: string;
  client: IAgoraRTCClient;
  joinRTCRoom(payload: { camera: boolean; microphone: boolean }): void;
  initStream(): void;
}

export interface AgoraUser {
  channel: string;
  username: string;
  role: "host" | "audience";
  token: string;
}

export interface AgoraClientOptions {
  appId: string;
  webConfig: ClientConfig;
  user?: AgoraUser;
}
export interface AgoraEventHandler {
  onUserPublished(
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ): void;
}
export class AgoraClient implements AgoraClientSDK {
  _client?: IAgoraRTCClient;
  _options: AgoraClientOptions;
  _cameraTrack?: ICameraVideoTrack;
  _microphoneTrack?: IMicrophoneAudioTrack;
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
  get client(): IAgoraRTCClient {
    return this._client as IAgoraRTCClient;
  }
  get clientId(): string {
    return (this._client as any).clientId;
  }
  get clientConfig(): ClientConfig {
    return this.options.webConfig as ClientConfig;
  }
  get appId(): string {
    return this.options.appId;
  }
  get agoraRTC(): IAgoraRTC {
    return AgoraRTC;
  }
  constructor(options: AgoraClientOptions) {
    this._options = options;
  }
  joined: boolean = false;
  publishedVideo: boolean = false;
  publishedAudio: boolean = false;

  async joinRTCRoom(options: { camera?: boolean; microphone?: boolean }) {
    if (this._client) return;
    this._client = this.agoraRTC.createClient(this.clientConfig);
    await this.client.join(
      this.appId,
      this.user.channel,
      this.user.token,
      this.user.username
    );
    this.joined = true;
    if (options.camera) {
      await this.openCamera();
    }
    if (options.microphone) {
      await this.openMicrophone();
    }
    await this.publish();

    this.client.on("user-published", async (user, mediaType) => {
      for (const remoteUser of this.client.remoteUsers) {
        this.subscribeUser(remoteUser, mediaType);
      }
    });
  }

  registerEventHandler(handler: AgoraEventHandler) {
    // this.client.on("user-published", handler.onUserPublished);
    // this.client.on("user-published", async (user, mediaType) => {
    //   for (const remoteUser of this.client.remoteUsers) {
    //     this.subscribeUser(remoteUser, mediaType);
    //   }
    // });
  }

  subscribedVideos: Array<string> = [];
  async subscribeUser(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") {
    if (!user) return;
    const userUID = "" + user.uid;
    if (mediaType === "video") {
      if (this.subscribedVideos.indexOf(userUID) === -1) {
        const remoteVideoTrack = await this.client.subscribe(user, mediaType);
        remoteVideoTrack.play(userUID);
      }
    }
  }

  async openMicrophone(): Promise<any> {
    if (this._microphoneTrack) return;
    this._microphoneTrack = await this.agoraRTC.createMicrophoneAudioTrack();
    this.microphoneTrack.on("track-ended", () => {
      this.microphoneTrack && this._closeMediaTrack(this.microphoneTrack);
    });
    this.microphoneTrack.play();
  }
  async openCamera(): Promise<any> {
    if (this._cameraTrack) return;
    this._cameraTrack = await this.agoraRTC.createCameraVideoTrack();
    this.cameraTrack.on("track-ended", () => {
      this.cameraTrack && this._closeMediaTrack(this.cameraTrack);
    });
    this.cameraTrack.play(this.user.username, { mirror: false });
  }

  private _closeMediaTrack(track: ILocalTrack) {
    if (!track) return;
    track.stop();
    track.close();

    if (track.trackMediaType === "video") {
      this._cameraTrack = undefined;
    }
    if (track.trackMediaType === "audio") {
      this._microphoneTrack = undefined;
    }
  }

  publishedTrackIds: any[] = [];
  async publish(): Promise<any> {
    if (!this.joined) return;
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
    if (this.cameraTrack) return;
    await this.openCamera();
  }

  unPublishAll() {
    this.client && this.client.unpublish();
  }
  unsubscribeAll() {
    // todo
  }
  reset() {
    this.unPublishAll();
    this._client?.leave();
    this._client = undefined;
    this.publishedVideo = false;
    this.publishedAudio = false;
    this._closeMediaTrack(this.cameraTrack);
    this._closeMediaTrack(this.microphoneTrack);
    this.joined = false;
    this.publishedTrackIds = [];
  }

  async setCamera(options: { enable: boolean }) {
    if (options.enable) {
      await this.openCamera();
      await this.publish();
    } else {
      await this.client?.unpublish(this.cameraTrack);
      this._closeMediaTrack(this.cameraTrack);
    }
  }

  async setMicrophone(options: { enable: boolean }) {
    if (options.enable) {
      await this.openMicrophone();
      await this.publish();
    } else {
      await this.client?.unpublish(this.microphoneTrack);
      this._closeMediaTrack(this.microphoneTrack);
    }
  }
  getRemoteUsers(): Array<IAgoraRTCRemoteUser> {
    if (!this.client) return [];
    return this.client.remoteUsers;
  }

  subcriseRemoteAudios(
    local: Array<{ studentId: string; tag: string }>,
    global: Array<{ studentId: string; tag: string }>
  ) {
    const remoteUsers = this.getRemoteUsers();
    for (const user of remoteUsers) {
      const userId = user.uid;
      let enable: boolean = true;
      if (local.length !== 0) {
        enable = local.find((ele) => ele.studentId === userId) !== undefined;
      } else if (global.length !== 0) {
        enable = global.find((ele) => ele.studentId === userId) !== undefined;
      }
      if (enable) this.client.subscribe(user, "audio");
      else this.client.unsubscribe(user, "audio");
      console.log(userId, enable);
    }
  }
}
