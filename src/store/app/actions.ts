import { ContentService } from "@/services";
import { ActionTree } from "vuex";
import { AppState, AppView, LayoutType, ToastData, UserRole, VCPlatform } from "./state";

export const CAMERA_ID_KEY = "__RT_CAMERA_ID__";

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
  setMuteAudio(store, payload: { status: number }) {
    store.commit("setMuteAudio", payload);
  },
  setHideVideo(store, payload: { status: number }) {
    store.commit("setHideVideo", payload);
  },
  setSignalRStatus(store, payload: { status: number }) {
    store.commit("setSignalRStatus", payload);
  },
  setClassRoomStatus(store, payload: { status: number }) {
    store.commit("setClassRoomStatus", payload);
  },
  async setCameraDeviceId(store, payload: string) {
    localStorage.setItem(CAMERA_ID_KEY, payload);
    store.commit("setCameraDeviceId", payload);
  },
  setUserRoleByView(store, payload: UserRole) {
    store.commit("setUserRoleByView", payload);
  },
  setVCPlatform(store, payload: VCPlatform) {
    store.commit("setVCPlatform", payload);
  },
};

export default actions;
