import { ActionContext, ActionTree } from "vuex";
import { ModeOneState } from "./state";

export interface ModeOneActionInterface<S, R> {
  setStudentOneId(s: ActionContext<S, R>, p: { id: string}): void;
  clearStudentOneId(s: ActionContext<S, R>, p: { id: string}): void;
}

export interface ModeOneAction<S, R>
  extends ActionTree<S, R>,
    ModeOneActionInterface<S, R> {}

const actions: ActionTree<ModeOneState, any> = {
  setStudentOneId({ commit }, p: { id: string }) {    
    commit("setStudentOneId", p);
  },
  clearStudentOneId({ commit }, p: { id: string }) {
    commit("clearStudentOneId", p);
  }
};
export default actions;
