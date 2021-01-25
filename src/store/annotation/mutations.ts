import { AnnotationModel } from "@/models";
import { MutationTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

export interface AnnotationMutationInterface<S> {
  setPointer(s: S, p: { pointer: Pointer }): void;
  setInfo(s: S, p: AnnotationModel): void;
}

export interface AnnotationMutation<S>
  extends MutationTree<S>,
    AnnotationMutationInterface<S> {}

const mutations: AnnotationMutation<AnnotationState> = {
  setPointer(s: AnnotationState, p: { pointer: Pointer }) {
    s.pointer = p.pointer;
  },
  setInfo(s: AnnotationState, p: AnnotationModel) {
    if (!p) return;
    s.pointer = p.pointer;
    s.mode = p.mode;
    s.drawing = p.drawing;
  },
};

export default mutations;
