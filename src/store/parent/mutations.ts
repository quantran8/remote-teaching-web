import { Parent } from "@/models";
import { ChildModel } from "@/services";
import { MutationTree } from "vuex";
import { ParentState } from "./state";

const mutations: MutationTree<ParentState> = {
  setChildren(state: ParentState, payload: Array<ChildModel>) {
    state.children = payload;
  },
  setInfo(state: ParentState, payload: Parent) {
    state.info = payload;
  },
};

export default mutations;
