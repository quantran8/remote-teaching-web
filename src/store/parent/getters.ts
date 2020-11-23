import { ChildModel } from "@/services";
import { GetterTree } from "vuex";
import { ParentState } from "./state";

const getters: GetterTree<ParentState, any> = {
  children(state: ParentState): Array<ChildModel> {
    return state.children;
  },
};

export default getters;
