import { GetterTree } from "vuex";
import { AnnotationState, Pointer, Sticker, UserShape } from "./state";

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
  isStickerMode(state: AnnotationState): boolean {
    return state.mode === 3;
  },
  shapes(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
  oneOneTeacherStrokes(state: AnnotationState): Array<string> {
    return state.oneToOne?.brushstrokes;
  },
  undoShape(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
  stickers(state: AnnotationState): Array<Sticker> {
    return state.stickers;
  },
  studentShape(state: AnnotationState): Array<UserShape> {
    return state.drawing?.studentShapes;
  },
  teacherShape(state: AnnotationState): Array<UserShape> {
    return state.drawing?.teacherShapes;
  },
  studentStrokes(state: AnnotationState): Array<string> {
    return state.drawing?.studentStrokes;
  },
  oneOneStudentStrokes(state: AnnotationState): Array<string> {
    return state.oneToOne?.studentStrokes;
  },
};

export default getters;
