import { GetterTree } from "vuex";
import { SpinState } from "./state";

const getters: GetterTree<SpinState, any> = {
  getMaskMain(state: SpinState): boolean {
    return state.maskMain;
  },
};

export default getters;
