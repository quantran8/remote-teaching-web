import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { GetterTree } from "vuex";
import { ClassView, StudentState, TeacherState } from "../interface";
import { StudentRoomState } from "./state";

const getters: GetterTree<StudentRoomState, any> = {
  globalAudios(state: StudentRoomState): Array<string> {
    return state.globalAudios;
  },
  error(state: StudentRoomState): GLError | null {
    return state.error;
  },
  info(state: StudentRoomState): RoomModel {
    return state.info as RoomModel;
  },
  classes(state: StudentRoomState): Array<ClassModel> {
    return state.classes;
  },
  students(state: StudentRoomState): Array<StudentState> {
    return state.students;
  },
  teacher(state: StudentRoomState): TeacherState {
    return state.teacher as TeacherState;
  },
  student(state: StudentRoomState): StudentState {
    return state.student as StudentState;
  },
  roomManager(state: StudentRoomState): StudentRoomManager {
    return state.manager as StudentRoomManager;
  },
  classView(state: StudentRoomState): ClassView {
    return state.classView;
  },
  isGalleryView(state: StudentRoomState) {
    return state.classView === ClassView.GALLERY;
  },
  isAllVideoHidden(state: StudentRoomState) {
    for (const student of state.students) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: StudentRoomState) {
    for (const student of state.students) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
};

export default getters;
