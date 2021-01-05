import { GetterTree } from "vuex";
import {InteractiveState, StudentId, Target} from "./state";

const getters: GetterTree<InteractiveState, any> = {
  isDesignatingTarget(state: InteractiveState): boolean {
    return state.isDesignatingTarget;
  },
  targets(state: InteractiveState): Array<Target> {
    return state.targets;
  },
  studentsSelected(state: InteractiveState): Array<StudentId> {
    return state.studentsSelected;
  }
};

export default getters;
