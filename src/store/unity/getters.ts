import { GetterTree } from "vuex";
import { UnityState } from "./state";

const getters: GetterTree<UnityState, any> = {
  messageTeacher(state: UnityState): string{
    return state.messageTeacher;
  },
  messageStudent(state: UnityState): string{
    return state.messageStudent;
  }
};

export default getters;
