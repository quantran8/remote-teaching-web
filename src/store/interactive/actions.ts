import { ActionContext, ActionTree } from "vuex";
import { InteractiveState, Target } from "./state";

export interface InteractiveActionInterface<S, R> {
  setDesignatingTarget(
    s: ActionContext<S, R>,
    p: { isDesignatingTarget: boolean }
  ): void;
  setTargets(s: ActionContext<S, R>, p: { targets: Array<Target> }): void;
}

export interface InteractiveAction<S, R>
  extends ActionTree<S, R>,
    InteractiveActionInterface<S, R> {}

const actions: ActionTree<InteractiveState, any> = {
  setDesignatingTarget({ commit }, p: { isDesignatingTarget: boolean }) {
    commit("setDesignatingTarget", p);
  },
  setTargets({ commit }, p: { targets: Array<Target> }) {
    commit("setTargets", p);
  },
};

export default actions;
