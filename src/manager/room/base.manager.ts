import { Logger } from '@/utils/logger';
import { VCPlatform } from "@/store/app/state";
import { ZoomClient, ZoomClientOptions, ZoomEventHandler } from "./../../zoom";
import { AgoraClient, AgoraClientOptions, AgoraEventHandler } from "@/agora";
import { store } from "@/store";
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
  agoraEventHandler!: AgoraEventHandler;

  abstract join(options: { classId: string; studentId?: string; teacherId?: string; camera?: boolean; microphone?: boolean }): Promise<any>;

  registerEventHandler(eventHandler: WSEventHandler) {
    return this.WSClient.registerEventHandler(eventHandler);
  }
  registerVideoCallSDKEventHandler(eventHandler: AgoraEventHandler | ZoomEventHandler) {
    if (store.getters.platform === VCPlatform.Agora) {
	  if(eventHandler) {
		this.agoraEventHandler = eventHandler as AgoraEventHandler;
        return this.agoraClient.registerEventHandler(eventHandler as AgoraEventHandler);
	  }
    }
  }

  reRegisterVideoCallSDKEventHandler() {
    if (store.getters.platform === VCPlatform.Agora) {
	  if(this.agoraEventHandler)
	  	return this.agoraClient.registerEventHandler(this.agoraEventHandler);
    }
  }


  isJoinedRoom() {
    if (store.getters.platform === VCPlatform.Agora) {
      this.agoraClient?.joined;
    } else {
      this.zoomClient?.joined;
    }
  }

  setCamera(options: { enable: boolean; videoEncoderConfigurationPreset?: string }) {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.setCamera(options);
    } else {
      return this.zoomClient.setCamera(options);
    }
  }

  setMicrophone(options: { enable: boolean }) {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.setMicrophone(options);
    } else {
      return this.zoomClient.setMicrophone(options);
    }
  }

  async updateAudioAndVideoFeed(cameras: Array<string>, audios: Array<string>) {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.updateAudioAndVideoFeed(cameras, audios);
    } else {
      Logger.log("Update audio and video feed")
	  return this.zoomClient.rerenderParticipantsVideo()
	}
  }

  async studentOneAndOne(cameras: Array<string>, audios: Array<string>) {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.updateAudioAndVideoFeed(cameras, audios);
    } 
  }

  getBandwidth() {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.getBandwidth();
    }
  }

  async close() {
    if (store.getters.platform === VCPlatform.Agora) {
      return this.agoraClient.reset();
    } else {
      return this.zoomClient.reset();
    }
  }
}
