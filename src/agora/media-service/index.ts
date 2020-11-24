import { LocalUserRenderer, RemoteUserRenderer } from "./renderer";
import { EventEmitter } from "events";
import AgoraRTC, { ITrack, ILocalTrack } from "agora-rtc-sdk-ng";
import { AgoraWebRtcWrapper } from "./rtc-wrapper";
import {
  IMediaService,
  RTCWrapperProvider,
  CameraOption,
  MicrophoneOption,
  PrepareScreenShareParams,
  StartScreenShareParams,
} from "../interfaces";
import { Logger } from "../../utils/logger";
import { AgoraClientOptions } from "..";

type JoinOption = {
  channel: string;
  token?: string | null;
  uid: number;
  info?: string;
};

export class MediaService extends EventEmitter implements IMediaService {
  sdkWrapper!: RTCWrapperProvider;

  cameraTestRenderer?: LocalUserRenderer;

  cameraRenderer?: LocalUserRenderer;

  microphoneTrack?: ILocalTrack;

  screenRenderer?: LocalUserRenderer;

  remoteUsersRenderer: RemoteUserRenderer[] = [];

  screenShareIds: any[] = [];

  constructor(options: AgoraClientOptions) {
    super();
    Logger.info(`[rtcProvider] appId: ${options.appId}`);
    this.sdkWrapper = new AgoraWebRtcWrapper(options);
    this.sdkWrapper.on("watch-rtt", (evt: any) => {
      this.fire("watch-rtt", evt);
    });
    this.sdkWrapper.on("network-quality", (quality: any) => {
      // console.log("[media-service] network quality >>>>>>>>>>>", quality)
      this.fire("network-quality", quality);
    });
    this.sdkWrapper.on("connection-state-change", (curState: any) => {
      console.log(
        "[media-service] connection-state-change >>>>>>>>>>>",
        curState
      );
      this.fire("connection-state-change", { curState });
    });
    this.sdkWrapper.on("volume-indication", ({ totalVolume }: any) => {
      this.fire("volume-indication", { totalVolume });
    });
    this.sdkWrapper.on("exception", (err: any) => {
      this.fire("exception", err);
    });
    this.sdkWrapper.on("user-unpublished", (evt: any) => {
      const user = evt.user;
      if (evt.mediaType === "audio") return;
      Logger.debug("sdkwrapper user-unpublished", user);
      const userIndex = this.remoteUsersRenderer.findIndex(
        (it: any) => it.uid === user.uid
      );
      if (userIndex !== -1) {
        const userRenderer = this.remoteUsersRenderer[userIndex];
        this.remoteUsersRenderer.splice(userIndex, 1);
        this.fire("user-unpublished", {
          remoteUserRender: userRenderer,
        });
      }
    });
    this.sdkWrapper.on("user-published", (evt: any) => {
      const user = evt.user;
      Logger.debug("sdkwrapper user-published", user);
      const userIndex = this.remoteUsersRenderer.findIndex(
        (it: any) => it.uid === user.uid
      );
      if (userIndex === -1) {
        this.remoteUsersRenderer.push(
          new RemoteUserRenderer({
            context: this,
            uid: +user.uid,
            videoTrack: user.videoTrack,
            sourceType: "default",
          })
        );
      } else {
        if (user.videoTrack) {
          this.remoteUsersRenderer[userIndex].videoTrack = user.videoTrack;
        }
      }
      this.fire("user-published", {
        remoteUserRender: this.remoteUsersRenderer[userIndex],
      });
    });
    this.sdkWrapper.on("rtcStats", (evt: any) => {
      this.fire("rtcStats", evt);
    });
    this.cameraRenderer = undefined;
    this.screenRenderer = undefined;
    this.remoteUsersRenderer = [];
    AgoraRTC.onCameraChanged = (info) => {
      this.fire("video-device-changed", info);
    };
    AgoraRTC.onMicrophoneChanged = (info) => {
      this.fire("audio-device-changed", info);
    };
    AgoraRTC.onAudioAutoplayFailed = () => {
      this.fire("audio-autoplay-failed");
    };
  }

  private fire(...params: any[]) {
    const [message, ...args] = params;
    if (
      !["volume-indication", "watch-rtt", "network-quality"].includes(message)
    ) {
      Logger.info(args[0], args);
    }
    this.emit(message, ...args);
  }

  getTestCameraLabel(): string {
    const defaultLabel = "";
    if (this.sdkWrapper.cameraTestTrack) {
      return this.sdkWrapper.cameraTestTrack.getTrackLabel();
    }

    return defaultLabel;
  }

  getTestMicrophoneLabel(): string {
    const defaultLabel = "";
    if (this.sdkWrapper.microphoneTestTrack) {
      return this.sdkWrapper.microphoneTestTrack.getTrackLabel();
    }
    return defaultLabel;
  }

  getCameraLabel(): string {
    const defaultLabel = "";
    if (this.sdkWrapper.cameraTrack) {
      return this.sdkWrapper.cameraTrack.getTrackLabel();
    }

    return defaultLabel;
  }

  getSpeakerLabel(): string {
    return "";
  }

  getMicrophoneLabel(): string {
    const defaultLabel = "";
    if (this.sdkWrapper.microphoneTrack) {
      return this.sdkWrapper.microphoneTrack.getTrackLabel();
    }
    return defaultLabel;
  }

  changePlaybackVolume(volume: number): void {
    this.sdkWrapper.changePlaybackVolume(volume);
  }

  async muteLocalVideo(val: boolean): Promise<any> {
    await this.sdkWrapper.muteLocalVideo(val);
  }

  async muteLocalAudio(val: boolean): Promise<any> {
    await this.sdkWrapper.muteLocalAudio(val);
  }

  async muteRemoteVideo(uid: any, val: boolean): Promise<any> {
    await this.sdkWrapper.muteRemoteVideo(uid, val);
  }

  async muteRemoteAudio(uid: any, val: boolean): Promise<any> {
    await this.sdkWrapper.muteRemoteAudio(uid, val);
  }

  async muteRemoteVideoByClient(
    client: any,
    uid: any,
    val: boolean
  ): Promise<any> {
    await this.sdkWrapper.muteRemoteVideoByClient(client, uid, val);
  }
  async muteRemoteAudioByClient(
    client: any,
    uid: any,
    val: boolean
  ): Promise<any> {
    await this.sdkWrapper.muteRemoteAudioByClient(client, uid, val);
  }

  init() {
    this.sdkWrapper.init();
  }

  release() {
    this.sdkWrapper.release();
  }

  async join(option: JoinOption): Promise<any> {
    await this.sdkWrapper.join(option);
  }

  async leave(): Promise<any> {
    await this.sdkWrapper.leave();
  }

  async joinChannel(option: JoinOption): Promise<any> {
    await this.sdkWrapper.joinChannel(option);
  }

  async leaveChannel(option: JoinOption): Promise<any> {
    await this.sdkWrapper.leaveChannel(option);
  }

  async publishChannel(): Promise<any> {
    await this.sdkWrapper.publishChannel();
  }

  async unpublishChannel(): Promise<any> {
    await this.sdkWrapper.unpublishChannel();
  }

  async publish(): Promise<any> {
    await this.sdkWrapper.publish();
  }

  async unpublish(): Promise<any> {
    await this.sdkWrapper.unpublish();
  }

  async openCamera(option?: CameraOption): Promise<any> {
    await this.sdkWrapper.openCamera(option);
    if (!this.sdkWrapper.cameraTrack) return;

    if (!this.cameraRenderer) {
      this.cameraRenderer = new LocalUserRenderer({
        context: this,
        uid: 0,
        sourceType: "default",
        videoTrack: this.sdkWrapper.cameraTrack,
      });
    } else {
      this.cameraRenderer.videoTrack = this.sdkWrapper.cameraTrack;
    }
  }

  async changeCamera(deviceId: string): Promise<any> {
    await this.sdkWrapper.changeCamera(deviceId);
  }

  async closeCamera() {
    await this.sdkWrapper.closeCamera();

    if (this.cameraRenderer) {
      this.cameraRenderer.stop();
      this.cameraRenderer = undefined;
    }
  }

  async openMicrophone(option?: MicrophoneOption): Promise<any> {
    await this.sdkWrapper.openMicrophone(option);
    this.microphoneTrack = this.sdkWrapper.microphoneTrack;
  }

  async changeMicrophone(deviceId: string): Promise<any> {
    await this.sdkWrapper.changeMicrophone(deviceId);
  }

  async closeMicrophone() {
    await this.sdkWrapper.closeMicrophone();
    this.microphoneTrack = undefined;
  }

  async openTestCamera(option: CameraOption): Promise<any> {
    await this.sdkWrapper.openTestCamera(option);
    if (!this.sdkWrapper.cameraTestTrack) return;

    if (!this.cameraTestRenderer) {
      this.cameraTestRenderer = new LocalUserRenderer({
        context: this,
        uid: 0,
        sourceType: "default",
        videoTrack: this.sdkWrapper.cameraTestTrack,
      });
    } else {
      this.cameraTestRenderer.videoTrack = this.sdkWrapper.cameraTestTrack;
    }
  }

  closeTestCamera() {
    this.sdkWrapper.closeTestCamera();
    if (this.cameraTestRenderer) {
      this.cameraTestRenderer.stop();
      this.cameraTestRenderer = undefined;
    }
  }

  async changeTestCamera(deviceId: string): Promise<any> {
    await this.sdkWrapper.changeTestCamera(deviceId);
  }

  async changeTestResolution(config: any) {
    await this.sdkWrapper.changeTestResolution(config);
  }

  async openTestMicrophone(option?: MicrophoneOption): Promise<any> {
    await this.sdkWrapper.openTestMicrophone(option);
  }

  closeTestMicrophone() {
    this.sdkWrapper.closeTestMicrophone();
  }

  async changeTestMicrophone(id: string): Promise<any> {
    await this.sdkWrapper.changeTestMicrophone(id);
  }

  async getCameras(): Promise<any> {
    return await this.sdkWrapper.getCameras();
  }

  async getMicrophones(): Promise<any> {
    return await this.sdkWrapper.getMicrophones();
  }

  async prepareScreenShare(
    params: PrepareScreenShareParams = {}
  ): Promise<any> {
    await this.sdkWrapper.prepareScreenShare(params);
    this.screenRenderer = new LocalUserRenderer({
      context: this,
      uid: 0,
      videoTrack: this.sdkWrapper.screenVideoTrack as ITrack,
      sourceType: "screen",
    });
  }

  async startScreenShare(option: StartScreenShareParams): Promise<any> {
    await this.sdkWrapper.startScreenShare(option);
  }

  async stopScreenShare(): Promise<any> {
    await this.sdkWrapper.stopScreenShare();
  }

  async changeResolution(config: any) {
    await this.sdkWrapper.changeResolution(config);
  }

  getPlaybackVolume(): number {
    return 100;
  }

  reset(): void {
    this.sdkWrapper.reset();
  }
}
