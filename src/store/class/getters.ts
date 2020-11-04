import { GetterTree } from "vuex";
import state from "../app/state";
import {
  ClassState,
  StudentInClassStatus,
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
};

export default getters;
