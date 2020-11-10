import { GetterTree } from "vuex";
import { AppState, LayoutType } from "./state";

const getters: GetterTree<AppState, any> = {
  appLayout(state: AppState): LayoutType {
    return state.layout;
  },
};

export default getters;
