import { ZoomClient, ZoomClientOptions } from "./../../zoom";
import { AgoraClient, AgoraClientOptions, AgoraEventHandler } from "@/agora";

import { GLSocketClient, WSEventHandler } from "@/ws";

export interface RoomOptions {
  agora: AgoraClientOptions;
  zoom: ZoomClientOptions;
}

export enum MediaDeviceStatus {
  DEFAULT = 0,
  LOCKED = 1,
  UNLOCKED = 2,
}

export interface MediaDevice {
  id: string;
  name: string;
}

export interface MediaStateInterface {
  devices: Array<MediaDevice>;
  activeDeviceId?: string;
  status: MediaDeviceStatus;
}

export abstract class BaseRoomManager<T extends GLSocketClient> {
  agoraClient!: AgoraClient;
  zoomClient!: ZoomClient;
  options!: RoomOptions;
  WSClient!: T;

  abstract join(options: { classId: string; studentId?: string; teacherId?: string; camera?: boolean; microphone?: boolean }): Promise<any>;

  registerEventHandler(eventHandler: WSEventHandler) {
    return this.WSClient.registerEventHandler(eventHandler);
  }
  registerAgoraEventHandler(eventHandler: AgoraEventHandler) {
    return this.agoraClient.registerEventHandler(eventHandler);
  }

  isJoinedRoom() {
    return this.agoraClient.joined;
  }

  setCamera(options: { enable: boolean; videoEncoderConfigurationPreset?: string }) {
    return this.agoraClient.setCamera(options);
  }

  setMicrophone(options: { enable: boolean }) {
    return this.agoraClient.setMicrophone(options);
  }

  updateAudioAndVideoFeed(cameras: Array<string>, audios: Array<string>) {
    return this.agoraClient.updateAudioAndVideoFeed(cameras, audios);
  }

  getBandwidth() {
    return this.agoraClient.getBandwidth();
  }

  async close() {
    return this.agoraClient.reset();
  }
}
