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
    isMuteAudio = MediaStatus.noStatus,
    isHideVideo = MediaStatus.noStatus,
  ) {
    const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
    const params: JoinRoomParams = {
      roomId: roomId,
      studentId: studentId,
      resolution,
      browserFingerPrinting: browserFingerPrinting,
    };
    if (isMuteAudio !== MediaStatus.noStatus) {
      let status = false;
      if (isMuteAudio === MediaStatus.mediaLocked) {
        status = true;
      }
      params.isMuteAudio = status;
    }
    if (isHideVideo !== MediaStatus.noStatus) {
      let status = false;
      if (isHideVideo === MediaStatus.mediaLocked) {
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
  sendRequestRaisingHand(IsRaisingHand: boolean) {
    return this.send(WSCmd.RAISING_HAND, IsRaisingHand);
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
  sendRequestStudentLeaveClass(roomId?: string, studentId?: string) {
    return this.send(WSCmd.STUDENT_LEAVE_CLASS, { roomId, studentId });
  }
  sendRequestToggleShape(payload: { userId: string; tag: string; visible: boolean }) {
    return this.send(WSCmd.TOGGLE_SHAPE, payload);
  }
  sendCheckTeacherMessageVersion() {
    return this.invoke(WSCmd.CHECK_MESSAGE_VERSION, null);
  }
  sendCapturedImageStatus(p:any){
    return this.send(WSCmd.SEND_CAPTURE_IMAGE_STATUS,p)
  }
}
