import { GetterTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

const getters: GetterTree<AnnotationState, any> = {
  pointer(state: AnnotationState): Pointer {
    return state.pointer;
  },
  mode(state: AnnotationState): number {
    return state.mode;
  },
  isPointerMode(state: AnnotationState): boolean {
    return state.mode === 1;
  },
  isDrawMode(state: AnnotationState): boolean {
    return state.mode === 2;
  },
  shapes(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
};

export default getters;
