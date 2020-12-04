import { AgoraClient, AgoraClientOptions, AgoraEventHandler } from "@/agora";
import { GLSocketClient, WSEventHandler } from "@/ws";

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

export abstract class BaseRoomManager<T extends GLSocketClient> {
  agoraClient!: AgoraClient;
  options!: RoomOptions;
  WSClient!: T;

  abstract async join(options: {
    classId: string;
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    microphone?: boolean;
  }): Promise<any>;

  registerEventHandler(eventHandler: WSEventHandler) {
    return this.WSClient.registerEventHandler(eventHandler);
  }
  registerAgoraEventHandler(eventHandler: AgoraEventHandler) {
    return this.agoraClient.registerEventHandler(eventHandler);
  }

  isJoinedRoom() {
    return this.agoraClient.joined;
  }

  async close() {
    this.agoraClient.reset();
  }
}
