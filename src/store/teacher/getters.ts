import { ClassModel } from "@/models/class.model";
import { GetterTree } from "vuex";
import { TeacherState } from "./state";

const getters: GetterTree<TeacherState, any> = {
  classes(state: TeacherState): Array<ClassModel> {
    return state.classes;
  },
};

export default getters;
