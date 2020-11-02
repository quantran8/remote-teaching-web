import { GetterTree } from "vuex";
import { AppState } from "./state";

const getters: GetterTree<AppState, any> = {
  isHeaderVisible(state: AppState): boolean {
    return state.layout.header.visible;
  },
  isFooterVisible(state: AppState): boolean {
    return state.layout.footer.visible;
  },
};

export default getters;
