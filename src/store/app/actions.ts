import { ActionTree } from "vuex";
import { AppState, LayoutState } from "./state";

const actions: ActionTree<AppState, any> = {
  setLayoutState(store, payload: LayoutState) {
    store.commit("setLayoutState", payload);
  },
  setLayout(store, payload: string | null) {
    const params = {
      header: {
        visible: true,
      },
      footer: {
        visible: true,
      },
    };
    if (payload && payload === "full") {
      params.header.visible = false;
      params.footer.visible = false;
    }
    store.commit("setLayoutState", params);
  },
};

export default actions;
