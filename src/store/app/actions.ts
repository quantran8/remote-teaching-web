import { ActionTree } from "vuex";
import { AppState, LayoutType } from "./state";

const actions: ActionTree<AppState, any> = {
  setLayout(store, payload: { layout: LayoutType }) {
    store.commit("setLayout", payload);
  },
};

export default actions;
