import { GetterTree } from "vuex";
import { AppState, AppView, LayoutType } from "./state";

const getters: GetterTree<AppState, any> = {
  appLayout(state: AppState): LayoutType {
    return state.layout;
  },
  appView(state: AppState): AppView {
    return state.appView;
  },
  appToast(state: AppState): string {
    return state.toast;
  },
};

export default getters;
