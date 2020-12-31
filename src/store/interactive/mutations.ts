import { MutationTree } from "vuex";
import { InteractiveState, Target } from "./state";

export interface InteractiveMutationInterface<S> {
  setDesignatingTarget(s: S, p: { isDesignatingTarget: boolean }): void;
  setTargets(s: S, p: { targets: Array<Target> }): void;
}

export interface InteractiveMutation<S>
  extends MutationTree<S>,
    InteractiveMutationInterface<S> {}

const mutations: InteractiveMutation<InteractiveState> = {
  setDesignatingTarget(
    s: InteractiveState,
    p: { isDesignatingTarget: boolean }
  ): void {
    s.isDesignatingTarget = p.isDesignatingTarget;
  },
  setTargets(s: InteractiveState, p: { targets: Array<Target> }) {
    s.targets = p.targets;
  },
};

export default mutations;
