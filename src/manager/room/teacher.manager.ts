import { ZoomClient } from "./../../zoom";
import { AgoraClient } from "@/agora";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { TeacherWSClient } from "@/ws";
import { BaseRoomManager, RoomOptions } from "./base.manager";
import { Logger } from "@/utils/logger";

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

  async join(options: { classId?: string; studentId?: string; teacherId?: string; camera?: boolean; microphone?: boolean; idOne?: string }) {
    Logger.log("Platform teacher is using: ", store.getters["platform"]);
    if (!options.teacherId || !options.classId) throw new Error("Missing Params");
    await this.WSClient.connect();
    if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient.joinRTCRoom({ ...options, videoEncoderConfigurationPreset: "480p" });
    } else {
      if (options.idOne) {
        await store.dispatch("teacherRoom/generateOneToOneToken", {
          classId: options.classId,
        });
      }
      await this.zoomClient.joinRTCRoom(options);
    }
  }

  async close(end?: boolean) {
    await this.WSClient.disconnect();
    if (store.getters.platform === VCPlatform.Agora) {
      await this.agoraClient.reset();
    } else {
      await this.zoomClient.reset(end);
    }
  }

  async rerenderParticipantsVideo() {
    try {
      if (store.getters.platform === VCPlatform.Zoom) {
        await this.zoomClient.rerenderParticipantsVideo();
      }
    } catch (error) {
		Logger.log("Rerender: ", error)
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
