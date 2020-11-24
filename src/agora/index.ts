import { Logger } from "@/utils/logger";
import AgoraRTC, {
  ClientConfig,
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
    const responseJoinChannel = await this.client.join(
      this.appId,
      this.user.channel,
      AGORA_APP_TOKEN,
      this.user.username
    );
    console.log("ResponseJoinChannel", responseJoinChannel);
    const entryRoom = await this.roomApi.entry(
      this.user.channel,
      this.user.username,
      AGORA_APP_TOKEN,
      "0",
      this.user.role
    );
    this.streamUUID = entryRoom.data.user.streamUuid;
    this.joined = true;

    this.client.on("user-joined", (payload) => {
      console.log("user-joined", payload);
    });
    // this.client.on("user-info-update", (payload: any) => {
    //   console.log("user-info-update", payload);
    // });

    this.client.on("user-info-updated", (payload) => {
      console.log("user-info-updated", payload);
    });
    this.client.on(
      "user-published",
      (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        console.log("user-published", user, mediaType);
        if (user.hasVideo) {
          console.log("user has video", user.videoTrack);
          user.videoTrack?.play("userStream1");
        } else {
          console.log("user dont have video");
        }
      }
    );

    console.log("remoteUsers", this.client.remoteUsers);
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

    if (this.joined && this.publishedVideo) {
      const cameraId = this.cameraTrack.getTrackId();
      await this.client.publish([this.cameraTrack]);
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
    this._cameraTrack = await this.agoraRTC.createCameraVideoTrack();
    this.cameraTrack.play("userStreamID");
    if (this.joined && !this.publishedVideo) {
      const cameraId = this.cameraTrack.getTrackId();
      await this.client.publish([this.cameraTrack]);
      this.publishedVideo = true;
      Logger.info(`[agora-web] publish camera [${cameraId}] success`);
    }

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
