import { GLSocketClient } from "./base.ws";

export enum TeacherWSCommand {
  STREAM_CONNECT = "TeacherStreamConnect",
  JOIN_CLASS = "TeacherJoinClass",
  MUTE_VIDEO = "TeacherMuteVideo",
  MUTE_AUDIO = "TeacherMuteAudio",
  MUTE_STUDENT_VIDEO = "TeacherMuteStudentVideo",
  MUTE_STUDENT_AUDIO = "TeacherMuteStudentAudio",
  MUTE_ALL_STUDENT_AUDIO = "TeacherMuteAllStudentAudio",
  MUTE_ALL_STUDENT_VIDEO = "TeacherMuteAllStudentVideo",
  SET_FOCUS_TAB = "TeacherSetFocusTab",
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
  sendRequestStreamConnect(streamId: string) {
    return this.send(TeacherWSCommand.STREAM_CONNECT, { streamId });
  }
  sendRequestMuteAllStudentAudio(IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_ALL_STUDENT_AUDIO, { IsMute });
  }
  sendRequestMuteAllStudentVideo(IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_ALL_STUDENT_VIDEO, { IsMute });
  }
  sendRequestMuteStudentVideo(StudentId: string, IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_STUDENT_VIDEO, {
      StudentId,
      IsMute,
    });
  }
  sendRequestMuteStudentAudio(StudentId: string, IsMute: boolean) {
    return this.send(TeacherWSCommand.MUTE_STUDENT_AUDIO, {
      StudentId,
      IsMute,
    });
  }
  sendRequestSetFocusTab(ForcusTab: number) {
    return this.send(TeacherWSCommand.SET_FOCUS_TAB, { ForcusTab });
  }
}
