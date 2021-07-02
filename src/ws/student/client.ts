import { StudentWSCommand as WSCmd } from "./command";
import { GLSocketClient } from "../base";
import DeviceDetector from "device-detector-js";

export class StudentWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string, studentId: string, browserFingerPrinting: string) {
    const deviceDetector = new DeviceDetector();
    const detector = deviceDetector.parse(window.navigator.userAgent);
    const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
    return this.send(WSCmd.JOIN_CLASS, {
      roomId: roomId,
      studentId: studentId,
      browser: detector.client ? detector.client.name : "",
      device: detector.device ? detector.device.type : "",
      bandwidth: "",
      resolution: resolution,
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
    return this.send(WSCmd.STUDENT_DRAWS_LINE, payload);
  }
}
