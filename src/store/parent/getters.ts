import { ChildModel } from "@/services";
import { GetterTree } from "vuex";
import { ParentState } from "./state";

const getters: GetterTree<ParentState, any> = {
  children(state: ParentState): Array<ChildModel> {
    return state.children;
  },
  selectedChild(state: ParentState): ChildModel {
    return state.selectedChild as ChildModel;
  },
};

export default getters;
