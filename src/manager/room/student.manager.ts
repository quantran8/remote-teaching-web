import { AgoraClient } from "@/agora";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { Logger } from "@/utils/logger";
import { StudentWSClient } from "@/ws";
//import { ZoomClient } from "@/zoom";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class StudentRoomManager extends BaseRoomManager<StudentWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    //if (store.getters.platform === VCPlatform.Agora) {
      this.agoraClient = new AgoraClient(options.agora);
    //} else {
    //  this.zoomClient = new ZoomClient(options.zoom);
    //}
    this.WSClient = new StudentWSClient({
      url: `${process.env.VUE_APP_REMOTE_TEACHING_SERVICE}/teaching`,
	  reConnectedCallback: async()=> { await this.wsReConnectSucessful();}
    });
    this.WSClient.init();
  }

  async wsReConnectSucessful(){
	//if (store.getters.platform === VCPlatform.Agora) {
		//if Agora client failed to be created first time, we shall try to recreate
		//Agora client once the internet connection is back (SignalR reconnected!)
		if(this.agoraClient.client == null && this.agoraClient.joinRoomOptions) {
			Logger.log("AGORA CLIENT FAILED TO INIT, REINIT WHEN SIGNALR RECONNECTED");
			await this.agoraClient.joinRTCRoom(this.agoraClient.joinRoomOptions, true);
			this.reRegisterVideoCallSDKEventHandler();
		}
	//   } else {
	// 	//do nothing now, will handle Zoom reconnect later
	//   }
  }

  async join(options: { classId?: string; studentId?: string; teacherId?: string; camera?: boolean; microphone?: boolean; idOne?: string }) {
    Logger.log("Platform is using: ", store.getters["platform"]);
    if (!options.studentId || !options.classId) throw new Error("Missing Params");
    await this.WSClient.connect();
    //if (store.getters.platform === VCPlatform.Agora) {

	  Logger.log("AGORA CLIENT INIT FIRST TIME");
      await this.agoraClient.joinRTCRoom(options, false);

    // } else {
    //   if (options.idOne) {
    //     await store.dispatch("studentRoom/generateOneToOneToken", {
    //       classId: options.classId,
    //       studentId: options.studentId,
    //     });
    //   }
    //   await this.zoomClient.joinRTCRoom(options);
    // }
  }

  async close() {
    await this.WSClient.disconnect();
    //if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient?.reset();
    // } else {
    //   await this.zoomClient?.reset();
    // }
  }

  rerenderParticipantsVideo() {
    if (store.getters.platform === VCPlatform.Zoom) {
      //return this.zoomClient.rerenderParticipantsVideo();
    }
  }

  studentBackToMainRoom() {
    if (store.getters.platform === VCPlatform.Zoom) {
      //return this.zoomClient.studentBackToMainRoom();
    }
  }
}
