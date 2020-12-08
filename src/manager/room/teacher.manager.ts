import { AgoraClient } from "@/agora";
import { TeacherWSClient } from "@/ws";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class TeacherRoomManager extends BaseRoomManager<TeacherWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.WSClient = new TeacherWSClient({
      url: `${process.env.VUE_APP_REMOTE_TEACHING_SERVICE}/teaching`,
    });
    this.WSClient.init();
  }

  async join(options: {
    classId: string;
    studentId?: string;
    teacherId?: string;
    camera?: boolean;
    microphone?: boolean;
  }) {
    if (!options.teacherId || !options.classId)
      throw new Error("Missing Params");
    await this.WSClient.connect();
    await this.agoraClient.joinRTCRoom(options);
  }

  setCamera(options: { enable: boolean }) {
    return this.agoraClient.setCamera(options);
  }
  setMicrophone(options: { enable: boolean }) {
    return this.agoraClient.setMicrophone(options);
  }

  subcriseRemoteUsers(
    local: Array<{ studentId: string; tag: string }>,
    global: Array<{ studentId: string; tag: string }>
  ) {
    return this.agoraClient.subcriseRemoteUsers(
      local.map((s) => s.studentId),
      global.map((s) => s.studentId)
    );
  }
  unsubcriseRemoteUser(payload: {
    user: IAgoraRTCRemoteUser;
    mediaType: "video" | "audio";
  }) {
    return this.agoraClient.unsubcriseRemoteUser(payload);
  }
}
