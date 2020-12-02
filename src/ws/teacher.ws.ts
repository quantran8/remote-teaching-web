import { GLSocketClient } from "./base.ws";

export enum TeacherWSCommand {
  JOIN_CLASS = "TeacherJoinClass",
  MUTE_VIDEO = "TeacherMuteVideo",
  MUTE_AUDIO = "TeacherMuteAudio",
}

export class TeacherWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string) {
    return this.send(TeacherWSCommand.JOIN_CLASS, { roomId });
  }
  sendRequestMuteVideo(IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_VIDEO, { IsMute });
  }
  sendRequestMuteAudio(IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_AUDIO, { IsMute });
  }
}
