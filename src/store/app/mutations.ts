import { AppState, AppView, LayoutType } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AppState> = {
  setLayout(state, payload: { layout: LayoutType }) {
    state.layout = payload.layout;
  },
  setAppView(state, payload: { appView: AppView }) {
    state.appView = payload.appView;
  },
};

export default mutations;
