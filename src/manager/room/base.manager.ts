import { AgoraClient, AgoraClientOptions } from "@/agora";
import { GLSocketClient } from "@/ws";

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

  isJoinedRoom() {
    return this.agoraClient.joined;
  }

  async close() {
    this.agoraClient.reset();
  }
}
