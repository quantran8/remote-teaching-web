import { GetterTree } from "vuex";
import { ModeOneState } from "./state";

const getters: GetterTree<ModeOneState, any> = {
  getStudentModeOneId(state: ModeOneState): string{
    return state.idOne;
  }
};

export default getters;
