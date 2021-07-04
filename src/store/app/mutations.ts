import { AppState, AppView, LayoutType, ToastData } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AppState> = {
  setToast(state, payload: ToastData) {
    state.toast = payload;
  },
  setLayout(state, payload: { layout: LayoutType }) {
    state.layout = payload.layout;
  },
  setAppView(state, payload: { appView: AppView }) {
    state.appView = payload.appView;
  },
  setContentSignature(state, payload: string) {
    state.contentSignature = payload;
  },
  setMuteAudio(state, payload: { isMute: boolean }) {
    state.isMuteAudio = payload.isMute;
  },
  setHideVideo(state, payload: { isHide: boolean }) {
    state.isHideVideo = payload.isHide;
  },
};

export default mutations;
