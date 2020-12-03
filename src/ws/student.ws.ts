import { GLSocketClient } from "./base.ws";

export enum StudentWSCommand {
  JOIN_CLASS = "StudentJoinClass",
  MUTE_VIDEO = "StudentMuteVideo",
  MUTE_AUDIO = "StudentMuteAudio",
}

export class StudentWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string, studentId: string) {
    return this.send(StudentWSCommand.JOIN_CLASS, { roomId, studentId });
  }
  sendRequestMuteVideo(IsMute: boolean) {
    return this.send(StudentWSCommand.MUTE_VIDEO, { IsMute });
  }
  sendRequestMuteAudio(IsMute: boolean) {
    return this.send(StudentWSCommand.MUTE_AUDIO, { IsMute });
  }
}
