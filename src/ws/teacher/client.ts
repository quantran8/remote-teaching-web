import { GLSocketClient } from "../base";
import { TeacherWSCommand as WSCmd } from "./command";

export class TeacherWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string) {
    return this.send(WSCmd.JOIN_CLASS, { roomId: roomId });
  }
  sendRequestMuteVideo(IsMute: boolean) {
    return this.send(WSCmd.MUTE_VIDEO, { IsMute: IsMute });
  }
  sendRequestMuteAudio(IsMute: boolean) {
    return this.send(WSCmd.MUTE_AUDIO, { IsMute: IsMute });
  }
  sendRequestStreamConnect(streamId: string) {
    return this.send(WSCmd.STREAM_CONNECT, { streamId: streamId });
  }
  sendRequestMuteAllStudentAudio(IsMute: boolean) {
    return this.send(WSCmd.MUTE_ALL_STUDENT_AUDIO, {
      IsMute: IsMute,
    });
  }
  sendRequestMuteAllStudentVideo(IsMute: boolean) {
    return this.send(WSCmd.MUTE_ALL_STUDENT_VIDEO, {
      IsMute: IsMute,
    });
  }
  sendRequestMuteStudentVideo(StudentId: string, IsMute: boolean) {
    return this.send(WSCmd.MUTE_STUDENT_VIDEO, {
      StudentId: StudentId,
      IsMute: IsMute,
    });
  }
  sendRequestMuteStudentAudio(StudentId: string, IsMute: boolean) {
    return this.send(WSCmd.MUTE_STUDENT_AUDIO, {
      StudentId: StudentId,
      IsMute: IsMute,
    });
  }
  sendRequestSetFocusTab(ForcusTab: number) {
    return this.send(WSCmd.SET_FOCUS_TAB, { ForcusTab: ForcusTab });
  }
  sendRequestEndRoom(roomId: string) {
    return this.send(WSCmd.END_CLASS, { roomId: roomId });
  }
  sendRequestSetStudentBadge(StudentId: string, Badge: number) {
    return this.send(WSCmd.SET_STUDENT_BADGE, {
      StudentId: StudentId,
      Badge: Badge,
    });
  }
  sendRequestAddStudentAudio(StudentId: string) {
    return this.send(WSCmd.ADD_STUDENT_AUDIO, {
      StudentId: StudentId,
    });
  }
  sendRequestClearStudentAudio() {
    return this.send(WSCmd.CLEAR_STUDENT_AUDIO, {});
  }
  sendRequestAddGlobalAudio(StudentId: string) {
    return this.send(WSCmd.ADD_GLOBAL_STUDENT_AUDIO, {
      StudentId: StudentId,
    });
  }
  sendRequestClearGlobalAudio() {
    return this.send(WSCmd.CLEAR_GLOBAL_STUDENT_AUDIO, {});
  }

  sendRequestStartLessonContent(contentId: string) {
    return this.send(WSCmd.START_LESSON_CONTENT, { ContentId: contentId });
  }
  sendRequestEndLessonContent(contentId: string) {
    return this.send(WSCmd.END_LESSON_CONTENT, { ContentId: contentId });
  }
  sendRequestSetLessonItemContent(id: string) {
    return this.send(WSCmd.SET_LESSON_ITEM_CONTENT, { ContentId: id });
  }
  sendRequestBlackOutLessonContent(isBlackOut: boolean) {
    return this.send(WSCmd.BLACKOUT_LESSON_CONTENT, { IsBlackOut: isBlackOut });
  }
  sendRequestClearRaisingHand(id: string) {
    return this.send(WSCmd.CLEAR_RAISING_HAND, { studentId: id });
  }
  sendRequestSetClassAction(action: number){
    return this.send(WSCmd.SET_CLASS_ACTION, {Action: action});
  }
}