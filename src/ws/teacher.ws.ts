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
  END_CLASS = "TeacherEndClass",
  SET_STUDENT_BADGE = "TeacherSetStudentBadge",
  ADD_STUDENT_AUDIO = "TeacherAddStudentAudio",
  CLEAR_STUDENT_AUDIO = "TeacherClearStudentAudio",
  ADD_GLOBAL_STUDENT_AUDIO = "TeacherAddGlobalStudentAudio",
  CLEAR_GLOBAL_STUDENT_AUDIO = "TeacherClearGlobalStudentAudio",
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
  sendRequestEndRoom(roomId: string) {
    return this.send(TeacherWSCommand.END_CLASS, { roomId });
  }
  sendRequestSetStudentBadge(StudentId: string, Badge: number) {
    return this.send(TeacherWSCommand.SET_STUDENT_BADGE, { StudentId, Badge });
  }
  sendRequestAddStudentAudio(StudentId: string) {
    return this.send(TeacherWSCommand.ADD_STUDENT_AUDIO, { StudentId });
  }
  sendRequestClearStudentAudio() {
    return this.send(TeacherWSCommand.CLEAR_STUDENT_AUDIO, {});
  }
  sendRequestAddGlobalAudio(StudentId: string) {
    return this.send(TeacherWSCommand.ADD_GLOBAL_STUDENT_AUDIO, { StudentId });
  }
  sendRequestClearGlobalAudio() {
    return this.send(TeacherWSCommand.CLEAR_GLOBAL_STUDENT_AUDIO, {});
  }
}
