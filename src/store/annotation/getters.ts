import { GetterTree } from "vuex";
import { AnnotationState, Pointer, Sticker } from "./state";

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
  undoShape(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
  stickers(state: AnnotationState): Array<Sticker> {
    return state.stickers;
  }
};

export default getters;
