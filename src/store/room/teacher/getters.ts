import { BaseRoomManager } from "@/manager/room/base.manager";
import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel, RoomModel } from "@/models";
import { GetterTree } from "vuex";
import { ClassView, StudentState, TeacherState } from "../interface";
import { TeacherRoomState } from "./state";

const getters: GetterTree<TeacherRoomState, any> = {
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
  isAllVideoHidden(state: TeacherRoomState) {
    for (const student of state.students) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: TeacherRoomState) {
    for (const student of state.students) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
};

export default getters;
