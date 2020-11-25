import { ClassModel } from "@/models";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { TeacherState } from "./state";

const mutations: MutationTree<TeacherState> = {
  setClasses(state: TeacherState, payload: Array<ClassModel>) {
    state.classes = payload;
  },
  setInfo(state: TeacherState, payload: UserModel) {
    state.info = payload;
  },
};

export default mutations;
