import { StudentWSCommand as WSCmd } from "./command";
import { GLSocketClient } from "../base.ws";

export class StudentWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string, studentId: string) {
    return this.send(WSCmd.JOIN_CLASS, {
      roomId: roomId,
      studentId: studentId,
    });
  }
  sendRequestMuteVideo(IsMute: boolean) {
    return this.send(WSCmd.MUTE_VIDEO, { IsMute: IsMute });
  }
  sendRequestMuteAudio(IsMute: boolean) {
    return this.send(WSCmd.MUTE_AUDIO, { IsMute: IsMute });
  }
}
