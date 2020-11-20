import { IAgoraRTC, IAgoraRTCClient } from "agora-rtc-sdk";
import AgoraRtcEngine from "./electron/types";

declare function event_device_changed(evt: any): void;
declare function event_media_state_changed(evt: any): void;

type Option = any;

type RTCWrapperProvider = AgoraWebRtcWrapper | AgoraElectronRTCWrapper;

declare interface RTCProviderInitParams {
  agoraSdk: any;
  platform: string;
  codec: string;
  appId: string;
  electronLogPath?: {
    logPath: string;
    videoSourceLogPath: string;
  };
}

declare interface PrepareScreenShareParams {
  dom?: HTMLElement;
  shareAudio?: "enable" | "auto" | "disable";
  encoderConfig?: any;
}

declare interface StartScreenShareParams {
  windowId?: number;
  config?: {
    profile: number;
    rect: any;
    param: any;
  };
  params: {
    uid: any;
    channel: string;
    token: string;
    joinInfo?: string;
  };
  encoderConfig?: any;
}

declare interface CameraOption {
  deviceId: string;
  encoderConfig?: any;
}

declare interface MicrophoneOption {
  deviceId: string;
}

declare interface IAgoraRTCModule {
  init(): void;
  release(): void;

  join(option: Option): Promise<any>;
  leave(): Promise<any>;

  publish(): Promise<any>;
  unpublish(): Promise<any>;

  muteLocalVideo(val: boolean): Promise<any>;
  muteLocalAudio(val: boolean): Promise<any>;
  muteRemoteVideo(uid: any, val: boolean): Promise<any>;
  muteRemoteAudio(uid: any, val: boolean): Promise<any>;

  openCamera(option?: CameraOption): Promise<any>;
  changeCamera(deviceId: string): Promise<any>;
  closeCamera(): void;

  getCameras(): Promise<any[]>;

  openMicrophone(option?: MicrophoneOption): Promise<any>;
  changeMicrophone(deviceId: string): Promise<any>;
  closeMicrophone(): void;

  getMicrophones(): Promise<any[]>;

  prepareScreenShare(params?: PrepareScreenShareParams): Promise<any>;
  startScreenShare(params: StartScreenShareParams): Promise<any>;
  stopScreenShare(): Promise<any>;

  changePlaybackVolume(volume: number): void;

  on(event: "error", listener: (err: any) => void);
  on(
    event: "audio-device-changed",
    listener: typeof event_device_changed
  ): void;
  on(
    event: "video-device-changed",
    listener: typeof event_device_changed
  ): void;
  on(event: "user-joined", listener: (evt: any) => void);
  on(event: "user-left", listener: (evt: any) => void);
  on(event: "user-info-updated", listener: (evt: any) => void);
  on(event: "token-privilege-will-expire", listener: (evt: any) => void);
  on(event: "token-privilege-did-expire", listener: (evt: any) => void);
  on(
    event: "connection-state-change",
    listener: (state: any, reason: any) => void
  );
  on(event: "stream-fallback", listener: (state: any, reason: any) => void);
  on(event: "network-quality", listener: (stats: any) => void);
  on(event: "volume-indicator", listener: (result: any[]) => void);
}

declare interface IMediaService extends IAgoraRTCModule {
  sdkWrapper: RTCWrapperProvider;
  web: AgoraWebRtcWrapper;
  electron: AgoraElectronRTCWrapper;

  init(): void;
  release(): void;
}
