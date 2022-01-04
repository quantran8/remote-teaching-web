import { GetterTree } from "vuex";
import { AppState, AppView, LayoutType, ToastData, UserRole } from "./state";

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
  isMuteAudio(state: AppState): number {
    return state.isMuteAudio;
  },
  isHideVideo(state: AppState): number {
    return state.isHideVideo;
  },
  classRoomStatus(state: AppState): number {
    return state.classRoomStatus;
  },
  signalRStatus(state: AppState): number {
    return state.signalRStatus;
  },
  cameraDeviceId(state: AppState): string {
    return state.cameraDeviceId;
  },
  userRole(state: AppState): UserRole {
    return state.userRole;
  },
};

export default getters;
