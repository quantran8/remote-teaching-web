import { GetterTree } from "vuex";
import { AppState, AppView, LayoutType, ToastData } from "./state";

const getters: GetterTree<AppState, any> = {
  appLayout(state: AppState): LayoutType {
    return state.layout;
  },
  appView(state: AppState): AppView {
    return state.appView;
  },
  appToast(state: AppState): ToastData {
    return state.toast;
  },
  contentSignature(state: AppState): string {
    return state.contentSignature;
  },
  isMuteAudio(state: AppState): boolean {
    return state.isMuteAudio;
  },
  isHideVideo(state: AppState): boolean {
    return state.isHideVideo;
  },
};

export default getters;
