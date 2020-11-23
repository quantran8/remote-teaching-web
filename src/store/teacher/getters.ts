import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState) {
    return state.classes;
  },
};

export default getters;
