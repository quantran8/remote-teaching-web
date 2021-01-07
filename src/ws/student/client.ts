import { StudentWSCommand as WSCmd } from "./command";
import { GLSocketClient } from "../base";

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

  sendRequestRaisingHand() {
    return this.send(WSCmd.RAISING_HAND, {});
  }
  sendRequestLike() {
    return this.send(WSCmd.LIKE, {});
  }
  sendRequestAnswer(payload: {
    x: number, y: number, contentId: string}) {
    return this.invoke(WSCmd.ANSWER, payload);
  }
}
