import { AppState, LayoutState } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AppState> = {
  setLayoutState(state, payload: LayoutState) {
    state.layout = payload;
  },
};

export default mutations;
