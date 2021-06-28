import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel, RoomModel } from "@/models";
import { GetterTree } from "vuex";
import { ClassView, InClassStatus, StudentState, TeacherState } from "../interface";
import { ClassAction } from "../student/state";
import { TeacherRoomState } from "./state";

const getters: GetterTree<TeacherRoomState, any> = {
  isConnected(state: TeacherRoomState): boolean {
    if (!state.manager || !state.manager.WSClient) return false;
    return state.manager.WSClient.isConnected;
  },
  enableAudios(state: TeacherRoomState): Array<string> {
    if (state.localAudios.length > 0) return state.localAudios;
    else if (state.globalAudios.length > 0) return state.globalAudios;
    return [];
  },
  globalAudios(state: TeacherRoomState): Array<{ studentId: string; tag: string }> {
    return state.students
      .filter(s => state.globalAudios.indexOf(s.id) !== -1)
      .map(s => {
        return {
          studentId: s.id,
          tag: `${s.index + 1}`,
        };
      });
  },
  localAudios(state: TeacherRoomState): Array<{ studentId: string; tag: string }> {
    return state.students
      .filter(s => state.localAudios.indexOf(s.id) !== -1)
      .map(s => {
        return {
          studentId: s.id,
          tag: `${s.index + 1}`,
        };
      });
  },
  info(state: TeacherRoomState): RoomModel {
    return state.info as RoomModel;
  },
  error(state: TeacherRoomState): any {
    return state.error;
  },
  classes(state: TeacherRoomState): Array<ClassModel> {
    return state.classes;
  },
  students(state: TeacherRoomState): Array<StudentState> {
    return state.students;
  },
  teacher(state: TeacherRoomState): TeacherState {
    return state.teacher as TeacherState;
  },
  roomManager(state: TeacherRoomState): TeacherRoomManager {
    return state.manager as TeacherRoomManager;
  },
  classView(state: TeacherRoomState): ClassView {
    return state.classView;
  },
  isGalleryView(state: TeacherRoomState) {
    return state.classView === ClassView.GALLERY;
  },
  isLessonPlanView(state: TeacherRoomState) {
    return state.classView === ClassView.LESSON_PLAN;
  },
  // isGameView(state: TeacherRoomState) {
  //   return state.classView === ClassView.GAME;
  // },
  isAllVideoHidden(state: TeacherRoomState) {
    const allStudents = state.students.filter(s => s.status === InClassStatus.JOINED);
    for (const student of allStudents) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: TeacherRoomState) {
    const allStudents = state.students.filter(s => s.status === InClassStatus.JOINED);
    for (const student of allStudents) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
  classAction(state: TeacherRoomState): ClassAction {
    return state.classAction;
  },
  getStudentModeOneId(state: TeacherRoomState): string {
    return state.idOne;
  },
  speakingUsers(state: TeacherRoomState): Array<string> {
    return state.speakingUsers;
  },
  isDisconnected(state: TeacherRoomState): boolean {
    return state.isDisconnected;
  },
  isLowBandWidth(state: TeacherRoomState): boolean {
    return state.isLowBandWidth;
  },
  listStudentLowBandWidth(state: TeacherRoomState): string[] {
    return state.listStudentLowBandWidth;
  },
  currentLesson(state: TeacherRoomState): number {
    return state.currentLesson;
  },
  currentUnit(state: TeacherRoomState): number {
    return state.currentUnit;
  },
};

export default getters;
