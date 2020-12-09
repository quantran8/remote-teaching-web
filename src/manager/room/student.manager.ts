import { AgoraClient } from "@/agora";
import { StudentWSClient } from "@/ws";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { BaseRoomManager, RoomOptions } from "./base.manager";

export class StudentRoomManager extends BaseRoomManager<StudentWSClient> {
  constructor(options: RoomOptions) {
    super();
    this.options = options;
    this.agoraClient = new AgoraClient(options.agora);
    this.WSClient = new StudentWSClient({
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
    if (!options.studentId || !options.classId)
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

  subcriseRemoteUsers(global: Array<string>, teacherId: string) {
    return this.agoraClient.studentSubcriseRemoteUsers(global, teacherId);
  }

  unsubcriseRemoteUser(payload: {
    user: IAgoraRTCRemoteUser;
    mediaType: "video" | "audio";
  }) {
    return this.agoraClient.unsubcriseRemoteUser(payload);
  }

  updateAudioAndVideoFeed(cameras: Array<string>, audios: Array<string>) {
    return this.agoraClient.updateAudioAndVideoFeed(cameras, audios);
  }

  async close() {
    await this.WSClient.disconnect();
    await this.agoraClient.reset();
  }
}
