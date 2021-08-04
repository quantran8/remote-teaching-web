import AgoraRTC, {
  ClientConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack,
  IRemoteTrack,
  UID,
  VideoEncoderConfigurationPreset,
} from "agora-rtc-sdk-ng";
import { isEqual } from "lodash";
import { AgoraRTCErrorCode } from "./interfaces";
import { store } from "@/store";

export interface AgoraClientSDK {
  client: IAgoraRTCClient;
  joinRTCRoom(payload: { camera: boolean; videoEncoderConfigurationPreset?: string; microphone: boolean }): void;
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
  onUserPublished(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): void;
  onUserUnPublished(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): void;
  onException(payload: any): void;
  onVolumeIndicator(
    result: {
      level: number;
      uid: UID;
    }[],
  ): void;
  onLocalNetworkUpdate(payload: any): void;
}

const LIMIT_COUNT = 10;
const INIT_COUNT = 1;
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

  publishedVideosTimeout: any = {};
  publishedAudiosTimeout: any = {};

  async joinRTCRoom(options: { camera?: boolean; videoEncoderConfigurationPreset?: string; microphone?: boolean }) {
    if (this._client || this.joined) return;
    this._client = this.agoraRTC.createClient(this.clientConfig);
    this.client.on("user-published", (user, mediaType) => {
      console.log("user-published", user.uid, mediaType);
      if (mediaType === "video") {
        if (this.publishedVideosTimeout[user.uid]) {
          clearTimeout(this.publishedVideosTimeout[user.uid]);
        }
        this.publishedVideosTimeout[user.uid] = setTimeout(() => {
          for (const [index, { userId }] of this.subscribedVideos.entries()) {
            if (userId === user.uid) {
              this.subscribedVideos.splice(index, 1);
            }
          }
          console.log("video starting update ...");
          if (this.options.user?.role === "host") {
            store.dispatch("teacherRoom/updateAudioAndVideoFeed", {});
          } else {
            store.dispatch("studentRoom/updateAudioAndVideoFeed", {});
          }
        }, 500);
      }
      if (mediaType === "audio") {
        if (this.publishedAudiosTimeout[user.uid]) {
          clearTimeout(this.publishedAudiosTimeout[user.uid]);
        }
        this.publishedAudiosTimeout[user.uid] = setTimeout(() => {
          for (const [index, { userId }] of this.subscribedAudios.entries()) {
            if (userId === user.uid) {
              this.subscribedAudios.splice(index, 1);
            }
          }
          console.log("audio starting update ...");
          if (this.options.user?.role === "host") {
            store.dispatch("teacherRoom/updateAudioAndVideoFeed", {});
          } else {
            store.dispatch("studentRoom/updateAudioAndVideoFeed", {});
          }
        }, 500);
      }
    });
    this.client.on("user-unpublished", (user, mediaType) => {
      console.log("user-unpublished", user.uid, mediaType);
      if (this.publishedVideosTimeout[user.uid]) {
        clearTimeout(this.publishedVideosTimeout[user.uid]);
      }
      if (this.publishedAudiosTimeout[user.uid]) {
        clearTimeout(this.publishedAudiosTimeout[user.uid]);
      }
      if (this.options.user?.role === "host") {
        store.dispatch("teacherRoom/updateAudioAndVideoFeed", {});
      } else {
        store.dispatch("studentRoom/updateAudioAndVideoFeed", {});
      }
    });
    this.client.on("user-left", user => {
      console.log("user-left", user.uid);
    });
    this.client.on("user-joined", user => {
      console.log("user-joined", user.uid);
    });
    this.agoraRTC.setLogLevel(1);
    await this.client.join(this.options.appId, this.user.channel, this.user.token, this.user.username);
    this.joined = true;
    if (options.camera) {
      await this.openCamera(options.videoEncoderConfigurationPreset);
    }
    if (options.microphone) await this.openMicrophone();
    this.client?.enableAudioVolumeIndicator();
    await this._publish();
  }

  registerEventHandler(handler: AgoraEventHandler) {
    this.client.on("exception", handler.onException);
    this.client.on("volume-indicator", handler.onVolumeIndicator);
    this.client.on("network-quality", handler.onLocalNetworkUpdate);
    this.client.on("connection-state-change", (currentState, prevState, reason) => {
      console.log("connection state changed! => currentState", currentState);
      console.log("connection state changed! => prevState", prevState);
      console.log("connection state changed! => reason", reason);
    });
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
      console.log("1");
      this.microphoneTrack.on("track-ended", () => {
        console.log("run vao track-end");
        this.microphoneTrack && this._closeMediaTrack(this.microphoneTrack);
      });
      console.log("2");
      this.microphoneError = null;
      //   this.setupHotPlugging();
    } catch (err) {
      console.log("3");

      this.microphoneError = err;
    }
  }

  cameraError: {
    code: string;
    message: string;
  } | null = null;

  /**
   * Opens camera with the resolution is set to 240x180 for every user by default.
   * See {VideoEncoderConfigurationPreset} for more presets.
   * @param {string} videoEncoderConfigurationPreset
   */
  async openCamera(videoEncoderConfigurationPreset: string = "180p_4"): Promise<any> {
    if (this._cameraTrack) return;
    try {
      this._cameraTrack = await this.agoraRTC.createCameraVideoTrack();
      const preset = <VideoEncoderConfigurationPreset>videoEncoderConfigurationPreset;
      await this._cameraTrack.setEncoderConfiguration(preset);
      this.cameraTrack.on("track-ended", () => {
        this.cameraTrack && this._closeMediaTrack(this.cameraTrack);
      });
      this.cameraTrack.play(this.user.username, { mirror: true });
      this.cameraError = null;
    } catch (err) {
      this.cameraError = err;
    }
  }

  private _closeMediaTrack(track: ILocalTrack) {
    if (track) {
      try {
        track.stop();
        track.close();
        if (track.trackMediaType === "video") {
          this._cameraTrack = undefined;
        }
        if (track.trackMediaType === "audio") {
          this._microphoneTrack = undefined;
        }
      } catch (error) {
        if (track) {
          track.stop();
          track.close();
          if (track.trackMediaType === "video") {
            this._cameraTrack = undefined;
          }
          if (track.trackMediaType === "audio") {
            this._microphoneTrack = undefined;
          }
        }
        throw `_closeMediaTrack ERROR::${error}`;
      }
    }
  }

  private async unpublishTrack(track: ILocalTrack) {
    if (!track) return;
    try {
      const trackId = track.getTrackId();
      const idx = this._publishedTrackIds.indexOf(trackId);
      if (this.cameraTrack && this.cameraTrack.getTrackId() === trackId) {
        await this.client.unpublish([this.cameraTrack]);
      }
      if (this.microphoneTrack && this.microphoneTrack.getTrackId() === trackId) {
        await this.client.unpublish([this.microphoneTrack]);
      }
      this._publishedTrackIds.splice(idx, 1);
    } catch (error) {
      if (!track) return;
      const trackId = track.getTrackId();
      const idx = this._publishedTrackIds.indexOf(trackId);
      if (this.cameraTrack && this.cameraTrack.getTrackId() === trackId) {
        await this.client.unpublish([this.cameraTrack]);
      }
      if (this.microphoneTrack && this.microphoneTrack.getTrackId() === trackId) {
        await this.client.unpublish([this.microphoneTrack]);
      }
      this._publishedTrackIds.splice(idx, 1);
      throw `unpublishTrack ERROR::${error}`;
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
    this.subscribedAudios = [];
    this.subscribedVideos = [];
  }

  cameraTimeout: any;
  isCamEnable: boolean = false;
  async setCamera(options: { enable: boolean; videoEncoderConfigurationPreset?: string }) {
    this.isCamEnable = options.enable;
    if (this.isCamEnable) {
      await this.openCamera(options.videoEncoderConfigurationPreset);
      await this._publish();
    } else {
      if (!this.cameraTrack) return;
      await this.unpublishTrack(this.cameraTrack);
      this._closeMediaTrack(this.cameraTrack);
    }
  }

  microTimeout: any;
  isMicEnable: boolean = false;
  async setMicrophone(options: { enable: boolean }) {
    this.isMicEnable = options.enable;
    if (this.isMicEnable) {
      await this.openMicrophone();
      await this._publish();
    } else {
      if (!this.microphoneTrack) return;
      await this.unpublishTrack(this.microphoneTrack);
      this._closeMediaTrack(this.microphoneTrack);
    }
  }

  private _getRemoteUser(userId: string): IAgoraRTCRemoteUser | undefined {
    if (!this.client) return undefined;
    return this.client.remoteUsers.find(e => isEqual(e.uid + "", userId));
  }

  async getBandwidth() {
    const stats = this.client.getRTCStats();
    return stats.OutgoingAvailableBandwidth / 1024;
  }

  timeoutId: any;
  videos: string[] = [];
  audios: string[] = [];
  async updateAudioAndVideoFeed(videos: Array<string>, audios: Array<string>) {
    this.videos = videos;
    this.audios = audios;
    const unSubscribeVideos = this.subscribedVideos.filter(s => videos.indexOf(s.userId) === -1).map(s => s.userId);
    const unSubscribeAudios = this.subscribedAudios.filter(s => audios.indexOf(s.userId) === -1).map(s => s.userId);
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

  reSubscribeAudiosCount: any = {};
  reSubscribeAudiosTimeout: any = {};
  async _subscribeAudio(userId: string, isAutoResubscribe = false) {
    if (!isAutoResubscribe) {
      if (this.reSubscribeAudiosTimeout[userId]) {
        clearTimeout(this.reSubscribeAudiosTimeout[userId]);
      }
      if (this.reSubscribeAudiosCount[userId]) {
        delete this.reSubscribeAudiosCount[userId];
      }
    }
    const subscribed = this.subscribedAudios.find(ele => ele.userId === userId);
    if (subscribed) return;
    const user = this._getRemoteUser(userId);
    if (!user || !user.hasAudio) return;
    try {
      const remoteTrack = await this.client.subscribe(user, "audio");
      remoteTrack.play();
      console.log(`audio of ${userId} played`);
      for (const [index, subscribedAudio] of this.subscribedAudios.entries()) {
        if (subscribedAudio.userId === userId) {
          this.subscribedAudios.splice(index, 1);
        }
      }
      this.subscribedAudios.push({ userId: userId, track: remoteTrack });
    } catch (err) {
      console.error("_subscribeAudio", err);
      const inAudios = this.audios.find(i => i === userId);
      if (inAudios) {
        if (this.reSubscribeAudiosCount[userId] === LIMIT_COUNT) {
          throw `Can't subscribe audio user with id ${userId}`;
        }
        if (!this.reSubscribeAudiosCount[userId]) {
          this.reSubscribeAudiosCount[userId] = INIT_COUNT;
          await this._subscribeAudio(userId, true);
        } else {
          this.reSubscribeAudiosCount[userId] = this.reSubscribeAudiosCount[userId] + 1;
          const timeoutId = setTimeout(async () => {
            await this._subscribeAudio(userId, true);
          }, 1000);
          this.reSubscribeAudiosTimeout[userId] = timeoutId;
        }
      }
    }
  }

  reSubscribeVideosCount: any = {};
  reSubscribeVideosTimeout: any = {};
  async _subscribeVideo(userId: string, isAutoResubscribe = false) {
    if (!isAutoResubscribe) {
      if (this.reSubscribeVideosTimeout[userId]) {
        clearTimeout(this.reSubscribeVideosTimeout[userId]);
      }
      if (this.reSubscribeVideosCount[userId]) {
        delete this.reSubscribeVideosCount[userId];
      }
    }
    const subscribed = this.subscribedVideos.find(ele => ele.userId === userId);
    if (subscribed) return;
    const user = this._getRemoteUser(userId);
    if (!user || !user.hasVideo) return;
    try {
      const remoteTrack = await this.client.subscribe(user, "video");
      remoteTrack.play(userId);
      console.log(`video of ${userId} played`);
      for (const [index, subscribedVideo] of this.subscribedVideos.entries()) {
        if (subscribedVideo.userId === userId) {
          this.subscribedVideos.splice(index, 1);
        }
      }
      this.subscribedVideos.push({ userId: userId, track: remoteTrack });
    } catch (err) {
      console.error("_subscribeVideo", err);
      const inVideos = this.videos.find(i => i === userId);
      if (inVideos) {
        if (this.reSubscribeVideosCount[userId] === LIMIT_COUNT) {
          throw `Can't subscribe video user with id ${userId}`;
        }
        if (!this.reSubscribeVideosCount[userId]) {
          this.reSubscribeVideosCount[userId] = INIT_COUNT;
          await this._subscribeVideo(userId, true);
        } else {
          this.reSubscribeVideosCount[userId] = this.reSubscribeVideosCount[userId] + 1;
          const timeoutId = setTimeout(async () => {
            await this._subscribeVideo(userId, true);
          }, 1000);
          this.reSubscribeVideosTimeout[userId] = timeoutId;
        }
      }
    }
  }

  async _unSubscribe(studentId: string, mediaType: "audio" | "video") {
    const user = this._getRemoteUser(studentId);
    if (user) await this.client.unsubscribe(user, mediaType);
    this._removeMediaTrack(studentId, mediaType);
  }

  private _removeMediaTrack(studentId: string, mediaType: "audio" | "video") {
    if (mediaType === "video") {
      const trackIndex = this.subscribedVideos.findIndex(ele => ele.userId === studentId);
      if (trackIndex === -1) return;
      this.subscribedVideos[trackIndex].track.stop();
      this.subscribedVideos.splice(trackIndex, 1);
    } else {
      const trackIndex = this.subscribedAudios.findIndex(ele => ele.userId === studentId);
      if (trackIndex === -1) return;
      this.subscribedAudios[trackIndex].track.stop();
      this.subscribedAudios.splice(trackIndex, 1);
    }
  }

  setupHotPlugging = () => {
    AgoraRTC.onMicrophoneChanged = async changedDevice => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === "ACTIVE") {
        this.microphoneTrack.setDevice(changedDevice.device.deviceId);
        // Switch to an existing device when the current device is unplugged.
      } else if (changedDevice.device.label === this.microphoneTrack.getTrackLabel()) {
        // const oldMicrophones = await AgoraRTC.getMicrophones();
        // oldMicrophones[0] && microphoneTrack.setDevice(oldMicrophones[0].deviceId);
        console.log("run vao hot plugging");
      }
    };
  };
}
