import { Logger } from "@/utils/logger";
import AgoraRTC, {
  ClientConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
  IRemoteTrack,
} from "agora-rtc-sdk-ng";
import { isEqual } from "lodash";

export interface AgoraClientSDK {
  client: IAgoraRTCClient;
  joinRTCRoom(payload: { camera: boolean; microphone: boolean }): void;
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
  onUserUnPublished(
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ): void;
  onException(payload: any): void;
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
      this.options.appId,
      this.user.channel,
      this.user.token,
      this.user.username
    );
    this.joined = true;
    if (options.camera) await this.openCamera();
    if (options.microphone) await this.openMicrophone();
    await this._publish();
  }

  registerEventHandler(handler: AgoraEventHandler) {
    this.client.on("user-published", handler.onUserPublished);
    this.client.on("user-unpublished", handler.onUserUnPublished);
    this.client.on("exception", handler.onException);
  }

  subscribedVideos: Array<{
    userId: string;
    track: IRemoteTrack;
  }> = [];
  subscribedAudios: Array<{
    userId: string;
    track: IRemoteTrack;
  }> = [];

  microphoneError: {
    code: string;
    message: string;
  } | null = null;
  async openMicrophone(): Promise<any> {
    if (this._microphoneTrack) return;
    try {
      this._microphoneTrack = await this.agoraRTC.createMicrophoneAudioTrack();
      this.microphoneTrack.on("track-ended", () => {
        this.microphoneTrack && this._closeMediaTrack(this.microphoneTrack);
      });
      this.microphoneTrack.play();
      this.microphoneError = null;
    } catch (err) {
      this.microphoneError = err;
    }
  }

  cameraError: {
    code: string;
    message: string;
  } | null = null;
  async openCamera(): Promise<any> {
    if (this._cameraTrack) return;
    try {
      this._cameraTrack = await this.agoraRTC.createCameraVideoTrack();

      // Set resolution to 240x180. See `VideoEncoderConfigurationPreset` for more presets.
      await this._cameraTrack.setEncoderConfiguration("180p_4");

      this.cameraTrack.on("track-ended", () => {
        this.cameraTrack && this._closeMediaTrack(this.cameraTrack);
      });
      this.cameraTrack.play(this.user.username, { mirror: false });
      this.cameraError = null;
    } catch (err) {
      this.cameraError = err;
    }
  }

  private _closeMediaTrack(track: ILocalTrack) {
    if (!track) return;
    track.stop();
    track.close();
    const index = this._publishedTrackIds.indexOf(track.getTrackId());
    this._publishedTrackIds.splice(index, 1);
    if (track.trackMediaType === "video") {
      this._cameraTrack = undefined;
    }
    if (track.trackMediaType === "audio") {
      this._microphoneTrack = undefined;
    }
  }

  _publishedTrackIds: string[] = [];
  private async _publish(): Promise<any> {
    if (!this.joined) return;
    if (this.cameraTrack) {
      const trackId = this.cameraTrack.getTrackId();
      if (this._publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.cameraTrack]);
        this.publishedVideo = true;
        this._publishedTrackIds.push(trackId);
      }
    }
    if (this.microphoneTrack) {
      const trackId = this.microphoneTrack.getTrackId();
      if (this._publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.microphoneTrack]);
        this.publishedAudio = true;
        this._publishedTrackIds.push(trackId);
      }
    }
  }

  async reset() {
    await this._client?.leave();
    this.publishedVideo = false;
    this.publishedAudio = false;
    this._closeMediaTrack(this.cameraTrack);
    this._closeMediaTrack(this.microphoneTrack);
    this.joined = false;
    this._publishedTrackIds = [];
    this._client = undefined;
    this.cameraError = null;
    this.microphoneError = null;
  }

  async setCamera(options: { enable: boolean }) {
    if (options.enable) {
      await this.openCamera();
      await this._publish();
    } else {
      await this.client?.unpublish(this.cameraTrack);
      this._closeMediaTrack(this.cameraTrack);
    }
  }

  async setMicrophone(options: { enable: boolean }) {
    if (options.enable) {
      await this.openMicrophone();
      await this._publish();
    } else {
      await this.client?.unpublish(this.microphoneTrack);
      this._closeMediaTrack(this.microphoneTrack);
    }
  }

  private _getRemoteUser(userId: string): IAgoraRTCRemoteUser | undefined {
    if (!this.client) return undefined;
    return this.client.remoteUsers.find((e) => isEqual(e.uid + "", userId));
  }

  async updateAudioAndVideoFeed(videos: Array<string>, audios: Array<string>) {
    const unSubscribeVideos = this.subscribedVideos
      .filter((s) => videos.indexOf(s.userId) === -1)
      .map((s) => s.userId);
    const unSubscribeAudios = this.subscribedAudios
      .filter((s) => audios.indexOf(s.userId) === -1)
      .map((s) => s.userId);

    for (let studentId of unSubscribeVideos) {
      await this._unSubscribe(studentId, "video");
    }

    for (let studentId of unSubscribeAudios) {
      await this._unSubscribe(studentId, "audio");
    }

    for (let studentId of videos) {
      await this._subscribeVideo(studentId);
    }

    for (let studentId of audios) {
      await this._subscribeAudio(studentId);
    }
  }

  async _subscribeAudio(userId: string) {
    const subscribed = this.subscribedAudios.find(
      (ele) => ele.userId === userId
    );
    if (subscribed) return;
    const user = this._getRemoteUser(userId);
    if (!user || !user.hasAudio) return;
    try {
      const remoteTrack = await this.client.subscribe(user, "audio");
      remoteTrack.play();
      this.subscribedAudios.push({ userId: userId, track: remoteTrack });
    } catch (err) {
      Logger.error("_subscribeAudio", err);
    }
  }

  async _subscribeVideo(userId: string) {
    const subscribed = this.subscribedVideos.find(
      (ele) => ele.userId === userId
    );
    if (subscribed) return;
    const user = this._getRemoteUser(userId);
    if (!user || !user.hasVideo) return;
    try {
      const remoteTrack = await this.client.subscribe(user, "video");
      remoteTrack.play(userId);
      this.subscribedVideos.push({ userId: userId, track: remoteTrack });
    } catch (err) {
      Logger.error("_subscribeVideo", err);
    }
  }

  async _unSubscribe(studentId: string, mediaType: "audio" | "video") {
    const user = this._getRemoteUser(studentId);
    if (user) await this.client.unsubscribe(user, mediaType);
    this._removeMediaTrack(studentId, mediaType);
  }

  private _removeMediaTrack(studentId: string, mediaType: "audio" | "video") {
    if (mediaType === "video") {
      const trackIndex = this.subscribedVideos.findIndex(
        (ele) => ele.userId === studentId
      );
      if (trackIndex === -1) return;
      this.subscribedVideos[trackIndex].track.stop();
      this.subscribedVideos.splice(trackIndex, 1);
    } else {
      const trackIndex = this.subscribedAudios.findIndex(
        (ele) => ele.userId === studentId
      );
      if (trackIndex === -1) return;
      this.subscribedAudios[trackIndex].track.stop();
      this.subscribedAudios.splice(trackIndex, 1);
    }
  }
}
