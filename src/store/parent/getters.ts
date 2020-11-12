import { GetterTree } from "vuex";
import { ParentState } from "./state";

const getters: GetterTree<ParentState, any> = {
  children(state: ParentState) {
    return state.children;
  },
};

export default getters;
