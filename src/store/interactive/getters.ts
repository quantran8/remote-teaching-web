import { GetterTree } from "vuex";
import { InteractiveState, Target } from "./state";

const getters: GetterTree<InteractiveState, any> = {
  isDesignatingTarget(state: InteractiveState): boolean {
    return state.isDesignatingTarget;
  },
  targets(state: InteractiveState): Array<Target> {
    return state.targets;
  },
};

export default getters;
