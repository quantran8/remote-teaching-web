import { StudentWSCommand as WSCmd } from "./command";
import { GLSocketClient } from "../base";
import { MediaStatus } from "@/models";

interface JoinRoomParams {
  roomId: string;
  studentId: string;
  resolution: string;
  browserFingerPrinting: string;
  isMuteAudio?: boolean;
  isMuteVideo?: boolean;
}

export class StudentWSClient extends GLSocketClient {
  sendRequestJoinRoom(
    roomId: string,
    studentId: string,
    browserFingerPrinting: string,
    isMuteAudio = MediaStatus.default,
    isHideVideo = MediaStatus.default,
  ) {
    const resolution = window.screen.width * window.devicePixelRatio + "x" + window.screen.height * window.devicePixelRatio;
    const params: JoinRoomParams = {
      roomId: roomId,
      studentId: studentId,
      resolution,
      browserFingerPrinting: browserFingerPrinting,
    };
    if (isMuteAudio !== MediaStatus.default) {
      let status = false;
      if (isMuteAudio === MediaStatus.isTrue) {
        status = true;
      }
      params.isMuteAudio = status;
    }
    if (isHideVideo !== MediaStatus.default) {
      let status = false;
      if (isHideVideo === MediaStatus.isTrue) {
        status = true;
      }
      params.isMuteVideo = status;
    }
    return this.send(WSCmd.JOIN_CLASS, params);
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
    return this.send(WSCmd.STUDENT_DRAWS_LINE, payload);
  }
}
