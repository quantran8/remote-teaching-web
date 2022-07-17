import { GetterTree } from "vuex";
import { SpinState } from "./state";

const getters: GetterTree<SpinState, any> = {
  getMaskMain(state: SpinState): boolean {
    return state.maskMain;
  },
  getMaskGrandAccess(state: SpinState): boolean {
    return state.maskGrandAccess;
  },
};

export default getters;
