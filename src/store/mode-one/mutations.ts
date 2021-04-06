import { MutationTree } from "vuex";
import { ModeOneState } from "./state";

export interface ModeOneMutationInterface<S> {
  setStudentOneId(s: S, p: { id: string }): void;
}

export interface ModeOneMutation<S>
  extends MutationTree<S>,
  ModeOneMutationInterface<S> {}

const mutations: ModeOneMutation<ModeOneState> = {
  setStudentOneId(s: ModeOneState, p: { id: string }) {
    s.idOne = p.id;
  },
  clearStudentOneId(s: ModeOneState, p: {id: string }) {
    s.idOne = p.id;
  },
};

export default mutations;
