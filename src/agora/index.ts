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
    if (this._client || this.joined) return;
    this._client = this.agoraRTC.createClient(this.clientConfig);
    this.agoraRTC.setLogLevel(4);
    await this.client.join(
      this.appId,
      this.user.channel,
      this.user.token,
      this.user.username
    );
    this.joined = true;
    if (options.camera) await this.openCamera();
    if (options.microphone) await this.openMicrophone();
    await this.publish();
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
  subscribedAudios: Array<string> = [];
  async subscribeUser(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") {
    if (!user) return;
    const userUID = "" + user.uid;
    if (mediaType === "video") {
      if (this.subscribedVideos.indexOf(userUID) === -1) {
        const remoteVideoTrack = await this.client.subscribe(user, mediaType);
        remoteVideoTrack.play(userUID);
        this.subscribedVideos.push(userUID);
      }
    } else {
      if (this.subscribedAudios.indexOf(userUID) === -1) {
        const remoteTrack = await this.client.subscribe(user, mediaType);
        remoteTrack.play();
        this.subscribedAudios.push(userUID);
      }
    }
  }

  async unsubscribeUser(
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ) {
    if (!user) return;
    const userUID = "" + user.uid;
    if (mediaType === "video") {
      const trackIndex = this.subscribedVideos.indexOf(userUID);
      if (trackIndex !== -1) {
        await this.client.unsubscribe(user, mediaType);
        this.subscribedVideos.splice(trackIndex, 1);
      }
    } else if (mediaType === "audio") {
      const trackIndex = this.subscribedAudios.indexOf(userUID);
      if (trackIndex !== -1) {
        await this.client.unsubscribe(user, mediaType);
        this.subscribedAudios.splice(trackIndex, 1);
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

  async unPublishAll() {
    if (this.client) await this.client.unpublish();
  }
  unsubscribeAll() {
    // todo
  }
  async reset() {
    await this.unPublishAll();
    await this._client?.leave();
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

  async subcriseRemoteUsers(
    local: Array<{ studentId: string; tag: string }>,
    global: Array<{ studentId: string; tag: string }>
  ) {
    const remoteUsers = this.getRemoteUsers();
    for (const user of remoteUsers) {
      await this.subscribeUser(user, "video");
      const userId = user.uid;
      let enable: boolean = true;
      if (local.length !== 0) {
        enable = local.find((ele) => ele.studentId === userId) !== undefined;
      } else if (global.length !== 0) {
        enable = global.find((ele) => ele.studentId === userId) !== undefined;
      }
      if (enable) await this.subscribeUser(user, "audio");
      else await this.unsubscribeUser(user, "audio");
    }
    console.log("Subscrise Videos", this.subscribedVideos);
    console.log("Subscrise Audios", this.subscribedAudios);
  }
}
