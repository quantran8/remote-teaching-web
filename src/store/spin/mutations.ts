import { MutationTree } from "vuex";
import { SpinState } from "./state";

const mutations: MutationTree<SpinState> = {
  setMaskMain(state: SpinState, value: boolean) {
    state.maskMain = value;
  },

  setMaskView(state: SpinState, value: boolean) {
    state.maskView = value;
  },

  setSplash(state: SpinState, value: boolean): void {
    state.splash = value;
  },
};

export default mutations;
