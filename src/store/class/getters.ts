import { GetterTree } from "vuex";
import {
  ClassState,
  StudentState,
  TeacherState,
} from "./state";

const getters: GetterTree<ClassState, any> = {
  students(state: ClassState): Array<StudentState> {
    return state.students;
  },
  teacher(state: ClassState): TeacherState {
    return state.teacher;
  },
  view(state: ClassState): number {
    return state.view;
  },
  isGalleryView(state: ClassState) {
    return state.view === 2;
  },
  isAllVideoHidden(state: ClassState) {
    for (const student of state.students) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: ClassState) {
    for (const student of state.students) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
};

export default getters;
