import { ContentService } from "@/services";
import { ActionTree } from "vuex";
import {AppState, AppView, LayoutType, ToastData} from "./state";

const actions: ActionTree<AppState, any> = {
  setToast(store, payload: ToastData) {
    store.commit("setToast", payload);
  },
  setLayout(store, payload: { layout: LayoutType }) {
    store.commit("setLayout", payload);
  },
  setAppView(store, payload: { appView: AppView }) {
    store.commit("setAppView", payload);
  },
  async loadContentSignature(store, _: {}) {
    const res = await ContentService.getSASUrl();
    if (res && res.pageContainer) {
      store.commit("setContentSignature", res.pageContainer);
    }
  },
};

export default actions;
