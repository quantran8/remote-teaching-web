import { AgoraClient } from "@/agora";
import { TeacherWSClient } from "@/ws";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class TeacherRoomManager extends BaseRoomManager<TeacherWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.WSClient = new TeacherWSClient({
      url: `http://vn-gs-server.grapecity.net:5010/teaching`,
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
    this.agoraClient.setCamera(options);
  }
  setMicrophone(options: { enable: boolean }) {
    this.agoraClient.setMicrophone(options);
  }
}
