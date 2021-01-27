import { AnnotationModel } from "@/models";
import { MutationTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

export interface AnnotationMutationInterface<S> {
  setPointer(s: S, pointer: Pointer): void;
  setMode(s: S, p: { mode: number }): void;
  setBrush(s: S, p: { drawing: Array<string> }): void;
  setInfo(s: S, p: AnnotationModel): void;
}

export interface AnnotationMutation<S>
  extends MutationTree<S>,
    AnnotationMutationInterface<S> {}

const mutations: AnnotationMutation<AnnotationState> = {
  setPointer(s: AnnotationState, p: Pointer) {
    s.pointer = p;
  },
  setMode(s: AnnotationState, p: { mode: number }) {
    s.mode = p.mode;
  },
  setBrush(s: AnnotationState, p: { drawing: Array<string> }) {
    s.drawing = p.drawing;
  },
  setInfo(s: AnnotationState, p: AnnotationModel) {
    if (!p) return;
    s.pointer = p.pointer;
    s.mode = p.mode;
    s.drawing = p.drawing;
  },
};

export default mutations;
