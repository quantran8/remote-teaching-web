import { GetterTree } from "vuex";
import { InteractiveState, StudentId, Target } from "./state";

const getters: GetterTree<InteractiveState, any> = {
  isDesignatingTarget(state: InteractiveState): boolean {
    return state.isDesignatingTarget;
  },
  targets(state: InteractiveState): Array<Target> {
    return state.targets;
  },
  localTargets(state: InteractiveState): Array<string> {
    return state.localTargets;
  },
  studentsSelected(state: InteractiveState): Array<StudentId> {
    return state.studentsSelected;
  },
  isAssigned(state: InteractiveState): boolean {
    return (
      state.targets.length > 0 && state.studentsSelected.find((s) => s.id === state.currentUserId) !==
      undefined
    );
  },
  currentUserId(state: InteractiveState): string {
    return state.currentUserId;
  },
};

export default getters;
