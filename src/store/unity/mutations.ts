import { MutationTree } from "vuex";
import { UnityState } from "./state";

export interface UnityMutationInterface<S> {
  setMessage(s: S, p: { message: string }): void;
}

export interface UnityMutation<S>
  extends MutationTree<S>,
    UnityMutationInterface<S> {}

const mutations: UnityMutation<UnityState> = {
  setMessage(s: UnityState, p: { message: string }) {
    console.log(p.message);
    
    s.message = p.message;
  },
};

export default mutations;
