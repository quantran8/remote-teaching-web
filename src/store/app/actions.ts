import { ActionTree } from "vuex";
import { AppState, AppView, LayoutType } from "./state";

const actions: ActionTree<AppState, any> = {
  setLayout(store, payload: { layout: LayoutType }) {
    store.commit("setLayout", payload);
  },
  setAppView(store, payload: { appView: AppView }) {
    store.commit("setAppView", payload);
  },
};

export default actions;
