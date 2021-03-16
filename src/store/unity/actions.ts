import { ActionContext, ActionTree } from "vuex";
import { UnityState } from "./state";

export interface UnityActionInterface<S, R> {
  setMessage(s: ActionContext<S, R>, p: { message: string}): void;
}

export interface UnityAction<S, R>
  extends ActionTree<S, R>,
    UnityActionInterface<S, R> {}

const actions: ActionTree<UnityState, any> = {
  setMessage({ commit }, p: { message: string }) {
    console.log(p.message);
    
    commit("setMessage", p);
  }
};
export default actions;
