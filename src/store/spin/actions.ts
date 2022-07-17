import { ActionTree } from "vuex";
import { SpinState } from "./state";

const actions: ActionTree<SpinState, any> = {
  setMaskMain(store, value: boolean) {
    store.commit("setMaskMain", value);
  },

  setMaskView(store, value: boolean) {
    store.commit("setMaskView", value);
  },

  setSplash(store, value: boolean): void {
    store.commit("setSplash", value);
  },

  setMaskGrandAccess(store, value: boolean): void {
    store.commit("setMaskGrandAccess", value);
  },
};

export default actions;
