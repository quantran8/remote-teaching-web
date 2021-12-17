import { AppState, AppView, LayoutType, ToastData, UserRole } from "./state";
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
  setMuteAudio(state, payload: { status: number }) {
    state.isMuteAudio = payload.status;
  },
  setHideVideo(state, payload: { status: number }) {
    state.isHideVideo = payload.status;
  },
  setSignalRStatus(state, payload: { status: number }) {
    state.signalRStatus = payload.status;
  },
  setClassRoomStatus(state, payload: { status: number }) {
    state.classRoomStatus = payload.status;
  },
  setCameraDeviceId(state, payload: string) {
    state.cameraDeviceId = payload;
  },
  setUserRoleByView(state, payload: UserRole) {
    state.userRole = payload;
  },
};

export default mutations;
