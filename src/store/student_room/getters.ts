import { RoomManager } from "@/manager/room.manager";
import { ClassModel, RoomModel } from "@/models";
import { GetterTree } from "vuex";
import { ClassView, RoomState, StudentState, TeacherState } from "./state";

const getters: GetterTree<RoomState, any> = {
  info(state: RoomState): RoomModel {
    return state.info as RoomModel;
  },
  classes(state: RoomState): Array<ClassModel> {
    return state.classes;
  },
  students(state: RoomState): Array<StudentState> {
    return state.students;
  },
  teacher(state: RoomState): TeacherState {
    return state.teacher as TeacherState;
  },
  student(state: RoomState): StudentState {
    return state.student as StudentState;
  },
  roomManager(state: RoomState): RoomManager {
    return state.manager as RoomManager;
  },
  classView(state: RoomState): ClassView {
    return state.classView;
  },
  isGalleryView(state: RoomState) {
    return state.classView === ClassView.GALLERY;
  },
  isAllVideoHidden(state: RoomState) {
    for (const student of state.students) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: RoomState) {
    for (const student of state.students) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
};

export default getters;
