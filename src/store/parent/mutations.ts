import { Parent } from "@/models";
import { ChildModel } from "@/services";
import { MutationTree } from "vuex";
import { ParentState } from "./state";

const mutations: MutationTree<ParentState> = {
  setChildren(state: ParentState, payload: Array<ChildModel>) {
    state.children = payload;
  },
  setSelectedChild(state: ParentState, payload: { childId: string }) {
    state.selectedChild = state.children.find(
      (ele) => ele.id === payload.childId
    );
  },
  setInfo(state: ParentState, payload: Parent) {
    state.info = payload;
  },
};

export default mutations;
