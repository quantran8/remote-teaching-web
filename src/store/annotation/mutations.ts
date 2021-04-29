import { AnnotationModel } from "@/models";
import { MutationTree } from "vuex";
import { AnnotationState, Pointer, Sticker, StudentShape } from "./state";

export interface AnnotationMutationInterface<S> {
  setPointer(s: S, pointer: Pointer): void;
  setMode(s: S, p: { mode: number }): void;
  addShape(s: S, p: string): void;
  setClearBrush(s: S, p: {}): void;
  setDeleteBrush(s: S, p: {}): void;
  setStickers(s: S, p: { stickers: Array<Sticker> }): void;
  setClearStickers(s: S, p: {}): void;
  setStudentAddShape(s: S, p: { studentShapes: Array<StudentShape> }): void;
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
  addShape(s: AnnotationState, p: string) {
    if (!p) return;
    s.drawing.brushstrokes = [...s.drawing.brushstrokes, p];
  },
  setClearBrush(s: AnnotationState, p: any) {
    s.drawing = {
      pencil: null,
      brushstrokes: [],
      studentShapes: [],
    };
  },
  setDeleteBrush(s: AnnotationState, p: {}) {
    s.drawing.brushstrokes.pop();
    s.drawing.brushstrokes = [...s.drawing.brushstrokes];
  },
  setStickers(s: AnnotationState, p: { stickers: Array<Sticker> }) {
    s.stickers = p.stickers;
  },
  setClearStickers(s: AnnotationState, p: {}) {
    s.stickers = [];
  },
  setStudentAddShape(s: AnnotationState, p: { studentShapes: Array<StudentShape> }) {
    s.drawing.studentShapes = p.studentShapes;
  },
  setInfo(s: AnnotationState, p: AnnotationModel) {
    if (!p) return;
    s.pointer = p.pointer;
    s.mode = p.mode;
    s.drawing = p.drawing;
    s.stickers = p.stickers;
    // const { studentShapes } = p.drawing;
    // s.drawing.studentShapes = studentShapes.map((s: any) => {
    //   return { studentId: s.studentId, brushstroke: s.brushstroke };
    // });
  },
};

export default mutations;
