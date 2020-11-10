import { AppState, LayoutType } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AppState> = {
  setLayout(state, payload: { layout: LayoutType }) {
    state.layout = payload.layout;
  },
};

export default mutations;
