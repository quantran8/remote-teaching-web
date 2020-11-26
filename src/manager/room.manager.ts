import { AgoraClient, AgoraClientOptions } from "@/agora";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

export interface RoomOptions {
  agora: AgoraClientOptions;
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

export class RoomManager {
  agoraClient: AgoraClient;
  options: RoomOptions;

  constructor(options: RoomOptions) {
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
  }
  isJoinedRoom() {
    return this.agoraClient.joined;
  }

  join(options: { camera?: boolean; microphone?: boolean; publish?: boolean }) {
    return this.agoraClient.joinRTCRoom(options);
  }

  setCamera(options: { enable: boolean }) {
    this.agoraClient.setCamera(options);
  }

  setMicrophone(options: { enable: boolean }) {
    this.agoraClient.setMicrophone(options);
  }

  close() {
    this.agoraClient.reset();
  }

  get remoteUsers(): Array<IAgoraRTCRemoteUser> {
    return this.agoraClient.getRemoteUsers();
  }
}
