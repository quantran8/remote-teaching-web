import { GetterTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

const getters: GetterTree<AnnotationState, any> = {
  pointer(state: AnnotationState): Pointer {
    return state.pointer;
  },
  mode(state: AnnotationState): number {
    return state.mode;
  },
  isAnnotationMode(state: AnnotationState): boolean {
    return state.mode === 1 || state.mode === 2;
  }
};

export default getters;
