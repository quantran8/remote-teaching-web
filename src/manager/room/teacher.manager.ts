import { ZoomClient } from "./../../zoom";
import { AgoraClient } from "@/agora";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { TeacherWSClient } from "@/ws";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class TeacherRoomManager extends BaseRoomManager<TeacherWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.zoomClient = new ZoomClient(options.zoom);

    this.WSClient = new TeacherWSClient({
      url: `${process.env.VUE_APP_REMOTE_TEACHING_SERVICE}/teaching`,
    });
    this.WSClient.init();
  }

  async join(options: { classId?: string; studentId?: string; teacherId?: string; camera?: boolean; microphone?: boolean }) {
    console.log("Platform is using: ", store.getters["platform"]);
    if (!options.teacherId || !options.classId) throw new Error("Missing Params");
    await this.WSClient.connect();
    if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient.joinRTCRoom({ ...options, videoEncoderConfigurationPreset: "480p" });
    } else {
      await this.zoomClient.joinRTCRoom(options);
    }
  }

  async close() {
    await this.WSClient.disconnect();
    if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient.reset();
    } else {
      await this.zoomClient.reset();
    }
  }
}
