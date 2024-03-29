import { AgoraClient } from "@/agora";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { Logger } from "@/utils/logger";
import { StudentWSClient } from "@/ws";
import { ZoomClient } from "@/zoom";
import { HubConnectionState } from "@microsoft/signalr";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class StudentRoomManager extends BaseRoomManager<StudentWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.zoomClient = new ZoomClient(options.zoom);
    this.WSClient = new StudentWSClient({
      url: `${process.env.VUE_APP_REMOTE_TEACHING_SERVICE}/teaching`,
      reConnectedCallback: async () => {
        await this.wsReConnectSucessful();
      },
    });
    this.WSClient.init();
  }

  async wsReConnectSucessful() {
    if (store.getters.platform === VCPlatform.Agora) {
      //if Agora client failed to be created first time, we shall try to recreate
      //Agora client once the internet connection is back (SignalR reconnected!)
      if (this.agoraClient.client == null && this.agoraClient.joinRoomOptions) {
        Logger.log("AGORA CLIENT FAILED TO INIT, REINIT WHEN SIGNALR RECONNECTED");
        await this.agoraClient.joinRTCRoom(this.agoraClient.joinRoomOptions, true);
        this.reRegisterVideoCallSDKEventHandler();
      }
    } else {
      //do nothing now, will handle Zoom reconnect later
      if (this.zoomClient._joinRoomOptions) {
        await this.zoomClient.joinRTCRoom(this.zoomClient._joinRoomOptions);
        if (this.zoomClient._oneToOneStudentId) {
          console.log("is in one and one");
          await this.zoomClient.studentJoinOneToOneSubSession();
        }
      }
    }
  }

  async join(options: {
    classId?: string;
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    microphone?: boolean;
    idOne?: string;
    reJoin?: boolean;
    isMirror?: boolean;
    isRemoteMirror?: boolean;
  }) {
    Logger.log("Platform is using: ", store.getters["platform"]);
    if (!options.studentId || !options.classId) throw new Error("Missing Params");
    await this.WSClient.connect();
    if (store.getters.platform === VCPlatform.Agora) {
      if (!options.reJoin) {
        Logger.log("AGORA CLIENT INIT FIRST TIME");
        await this.agoraClient.joinRTCRoom(options, false, async () => await this.callBackWhenAgoraJoinFailed());
      }
    } else {
      if (!options.reJoin) {
        await this.zoomClient.joinRTCRoom(options);
        if (options.idOne && options.studentId === options.idOne) {
          await this.zoomClient.studentJoinOneToOneSubSession();
        }
      }
    }
  }

  async callBackWhenAgoraJoinFailed() {
    //when Agora join failed, all Agora data has been reset
    //check if SignalR connected
    if (this.WSClient.hubConnection && this.WSClient.hubConnection.state === HubConnectionState.Connected) {
      Logger.log("AGORA CLIENT INIT OK BUT FAILED TO JOIN, REINIT NOW");
      await this.agoraClient.joinRTCRoom(this.agoraClient.joinRoomOptions, true);
      this.reRegisterVideoCallSDKEventHandler();
    }
    //if signalR not connected, when it reconnect or connect again it will init Agora again!
  }

  async close(end?: boolean) {
    await this.WSClient.disconnect();
    if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient?.reset();
    } else {
      await this.zoomClient?.reset(end);
    }
  }

  adjustRenderedVideoPosition() {
    if (store.getters.platform === VCPlatform.Zoom) {
      return this.zoomClient.adjustRenderedVideoPosition();
    }
  }

  studentBackToMainRoom() {
    if (store.getters.platform === VCPlatform.Zoom) {
      return this.zoomClient.backToMainSession();
    }
  }
}
