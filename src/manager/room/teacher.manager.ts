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
    publish?: boolean;
  }) {
    await this.WSClient.connect();
    await this.WSClient.sendRequestJoinRoom(options.classId);
    await this.agoraClient.joinRTCRoom(options);
  }

  setCamera(options: { enable: boolean; publish?: boolean }) {
    this.agoraClient.setCamera(options);
    this.WSClient.sendRequestMuteVideo(!options.enable);
  }
  setMicrophone(options: { enable: boolean; publish?: boolean }) {
    this.agoraClient.setMicrophone(options);
    this.WSClient.sendRequestMuteAudio(!options.enable);
  }
}
