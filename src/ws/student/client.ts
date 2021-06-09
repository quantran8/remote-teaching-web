import { StudentWSCommand as WSCmd } from "./command";
import { GLSocketClient } from "../base";

export class StudentWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string, studentId: string, browserFingerPrinting: string) {
    return this.send(WSCmd.JOIN_CLASS, {
      roomId: roomId,
      studentId: studentId,
      browserFingerPrinting: browserFingerPrinting,
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
  sendRequestAnswer(payload: { x: number; y: number; contentId: string }) {
    return this.invoke(WSCmd.ANSWER, payload);
  }
  sendRequestUnity(message: string) {
    return this.send(WSCmd.STUDENT_ACTION_GAME, message);
  }
  sendRequestStudentSetBrushstrokes(payload: any) {
    return this.send(WSCmd.STUDENT_SET_BRUSH_STROKES, payload);
  }

  sendRequestStudentLeaveClass(roomId?: string, studentId?: string) {
    return this.send(WSCmd.STUDENT_LEAVE_CLASS, { roomId, studentId });
  }
  sendRequestStudentDrawsLine(payload: any) {
    return this.invoke(WSCmd.STUDENT_DRAWS_LINE, payload);
  }
}
