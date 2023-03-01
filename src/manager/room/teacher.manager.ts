import { AgoraClient } from "@/agora";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { Logger } from "@/utils/logger";
import { TeacherWSClient } from "@/ws";
import { HubConnectionState } from "@microsoft/signalr";
import { ZoomClient } from "./../../zoom";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class TeacherRoomManager extends BaseRoomManager<TeacherWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.zoomClient = new ZoomClient(options.zoom);

    this.WSClient = new TeacherWSClient({
      url: `${process.env.VUE_APP_REMOTE_TEACHING_SERVICE}/teaching`,
      reConnectedCallback: async () => {
        await this.wsReConnectSucessful();
      },
    });
    this.WSClient.init();
  }

  async wsReConnectSucessful() {
    if (store.getters.platform === VCPlatform.Agora) {
      // if Agora client failed to be created first time, we shall try to recreate
      // Agora client once the internet connection is back (SignalR reconnected!)
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
          await this.zoomClient.teacherJoinOneToOneSubSession(this.zoomClient._oneToOneStudentId);
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
    Logger.log("Platform teacher is using: ", store.getters["platform"]);
    if (!options.teacherId || !options.classId) throw new Error("Missing Params");
    await this.WSClient.connect();
    if (store.getters.platform === VCPlatform.Agora) {
      if (!options.reJoin) {
        Logger.log("AGORA CLIENT INIT FIRST TIME");
        await this.agoraClient.joinRTCRoom(
          { ...options, videoEncoderConfigurationPreset: "480p" },
          false,
          async () => await this.callBackWhenAgoraJoinFailed(),
        );
      }
    } else {
      if (!options.reJoin) {
        await this.zoomClient.joinRTCRoom(options);
        if (options.idOne) {
          setTimeout(async () => {
            await this.zoomClient.teacherJoinOneToOneSubSession(options.idOne ?? "");
          }, 5000);
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
      await this.agoraClient.reset();
    } else {
      await this.zoomClient.reset(end);
    }
  }

  async adjustRenderedVideoPosition(userId?: string) {
    try {
      if (store.getters.platform === VCPlatform.Zoom) {
        await this.zoomClient.adjustRenderedVideoPosition(userId);
      }
    } catch (error) {
      Logger.log("Rerender: ", error);
    }
  }

  async removeParticipantVideo(userId: string) {
    if (store.getters.platform === VCPlatform.Zoom) {
      const user = this.zoomClient?.getParticipantByDisplayName(userId);
      if (!user) return;
      await this.zoomClient.removeParticipantVideo(user);
    }
  }
}
