import { Target } from "@/store/interactive/state";
import { Sticker } from "@/store/annotation/state";
import { GLSocketClient } from "../base";
import { TeacherWSCommand as WSCmd } from "./command";
import { MediaStatus } from "@/models";

interface JoinRoomParams {
  roomId: string;
  browserFingerPrinting: string;
  isMuteAudio?: boolean;
  isMuteVideo?: boolean;
}

export interface FabricObject {
  fabricId: string;
  fabricData: string;
}

export class TeacherWSClient extends GLSocketClient {
  sendRequestJoinRoom(roomId: string, browserFingerPrinting: string, isMuteAudio = MediaStatus.noStatus, isHideVideo = MediaStatus.noStatus) {
    const params: JoinRoomParams = { roomId: roomId, browserFingerPrinting: browserFingerPrinting };
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
  sendRequestSetTeachingMode(teachingMode: number) {
    return this.send(WSCmd.SET_TEACHING_MODE, teachingMode);
  }
  sendRequestEndRoom(roomId: string) {
    return this.send(WSCmd.END_CLASS, { roomId: roomId });
  }
  sendRequestDisableAllAnnotation(showPalette: boolean) {
    return this.send(WSCmd.TOGGLE_STUDENTS_PALETTES, showPalette);
  }
  sendRequestToggleAnnotation(StudentId: string, IsEnable: boolean) {
    return this.send(WSCmd.SET_STUDENT_PALETTE, {
      IsEnable: IsEnable,
      StudentId: StudentId,
    });
  }
  sendRequestSetStudentBadge(StudentIds: string[], Badge: number) {
    return this.send(WSCmd.SET_STUDENT_BADGE, {
      StudentIds: StudentIds,
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
  // sendRequestUnity(message: string) {
  //   return this.send(WSCmd.TEACHER_ACTION_GAME, message);
  // }
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
  sendRequestSetClassAction(action: number) {
    return this.send(WSCmd.SET_CLASS_ACTION, { Action: action });
  }
  sendRequestDesignateTarget(contentId: string, targets: Array<Target>, studentIds: Array<string>) {
    return this.send(WSCmd.DESIGNATE_TARGET, {
      ContentId: contentId,
      Targets: targets,
      StudentIds: studentIds,
    });
  }
  sendRequestAnswer(payload: { x: number; y: number; contentId: string }) {
    return this.invoke(WSCmd.TEACHER_ANSWER_INTERACTIVE, payload);
  }
  sendRequestAnswerAll(payload: {}) {
    return this.invoke(WSCmd.TEACHER_ANSWER_ALL, payload);
  }
  sendRequestSetPointer(payload: { x: number; y: number }) {
    return this.send(WSCmd.TEACHER_SET_POINTER, payload);
  }
  sendRequestUpdateAnnotationMode(mode: number) {
    return this.send(WSCmd.TEACHER_UPDATE_ANNOTATION_MODE, mode);
  }
  sendRequestClearAllBrush(payload: any) {
    return this.send(WSCmd.TEACHER_CLEAR_ALL_BRUSH_STROKES, {});
  }
  sendRequestResetZoom(payload: any) {
    return this.send(WSCmd.TEACHER_RESET_ZOOM, {});
  }
  sendRequestDeleteBrush(payload: any) {
    return this.send(WSCmd.TEACHER_UNDO_BRUSH, {});
  }
  sendRequestSetStickers(stickers: Array<Sticker>) {
    return this.send(WSCmd.TEACHER_SET_STICKERS, stickers);
  }
  sendRequestClearStickers(payload: any) {
    return this.send(WSCmd.TEACHER_CLEAR_STICKERS, {});
  }
  sendRequestSetOneToOne(payload: { status: boolean; id: string }) {
    return this.send(WSCmd.TEACHER_SET_ONE_TO_ONE, { StudentId: payload.id });
  }
  sendRequestSetWhiteboard(isShowWhiteBoard: boolean) {
    return this.send(WSCmd.TEACHER_SET_WHITEBOARD, isShowWhiteBoard);
  }
  sendRequestDrawLaser(payload: any) {
    const data = JSON.stringify(payload);
    return this.send(WSCmd.TEACHER_DRAW_LASER_PEN, data);
  }
  sendRequestCreateFabricObject(payload: FabricObject) {
    return this.send(WSCmd.TEACHER_CREATE_FABRIC_OBJECT, payload);
  }
  sendRequestModifyFabricObject(payload: FabricObject) {
    return this.send(WSCmd.TEACHER_MODIFY_FABRIC_OBJECT, payload);
  }
  sendRequestToggleAllShapes(payload: { userId: string; visible: boolean }) {
    return this.send(WSCmd.TOGGLE_ALL_SHAPES, payload);
  }
  sendRequestToggleShape(payload: { userId: string; tag: string; visible: boolean }) {
    return this.send(WSCmd.TOGGLE_SHAPE, payload);
  }
  sendCheckTeacherMessageVersion() {
    return this.invoke(WSCmd.CHECK_MESSAGE_VERSION, null);
  }
  sendRequestUpdateSessionAndUnit(payload: any) {
    return this.send(WSCmd.UPDATE_SESSION_LESSON_AND_UNIT, {});
  }
}
