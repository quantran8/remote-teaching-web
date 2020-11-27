import { AgoraClient, AgoraClientOptions } from "@/agora";
import { RTSocketClient } from "@/ws";
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
  wsClient: RTSocketClient;
  constructor(options: RoomOptions) {
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.wsClient = new RTSocketClient({
      url: `http://vn-gs-server.grapecity.net:5010/teaching`,
    });
    this.wsClient.init();
  }

  isJoinedRoom() {
    return this.agoraClient.joined;
  }

  async join(options: {
    classId?: string;
    camera?: boolean;
    microphone?: boolean;
    publish?: boolean;
  }) {
    if (options.classId) {
      await this.wsClient.connect();
    }
    return this.agoraClient.joinRTCRoom(options);
  }

  setCamera(options: { enable: boolean; publish?: boolean }) {
    this.agoraClient.setCamera(options);
  }

  setMicrophone(options: { enable: boolean; publish?: boolean }) {
    this.agoraClient.setMicrophone(options);
  }

  async close() {
    this.agoraClient.reset();
  }

  get remoteUsers(): Array<IAgoraRTCRemoteUser> {
    return this.agoraClient.getRemoteUsers();
  }
}
