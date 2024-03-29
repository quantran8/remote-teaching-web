import { AnnotationModel } from "@/models";
import { FabricObject } from "@/ws";
import { MutationTree } from "vuex";
import { AnnotationState, LastFabricUpdated, Pointer, Sticker, UserShape } from "./state";

export interface AnnotationMutationInterface<S> {
  setInfo(s: S, p: AnnotationModel): void;
  setPointer(s: S, pointer: Pointer): void;
  setMode(s: S, p: { mode: number }): void;
  addShape(s: S, p: string): void;
  setTeacherBrushes(s: S, p: Array<string>): void;
  setOneTeacherDrawsStrokes(s: S, p: string): void;
  setClearBrush(s: S, p: {}): void;
  setDeleteBrush(s: S, p: {}): void;
  setDeleteBrushOneOne(s: S, p: {}): void;
  setStickers(s: S, p: { stickers: Array<Sticker> }): void;
  setClearStickers(s: S, p: {}): void;
  setStudentAddShape(s: S, p: { studentShapes: Array<UserShape> }): void;
  setOneStudentAddShape(s: S, p: { studentShapes: Array<UserShape> }): void;
  setTeacherAddShape(s: S, p: { teacherShapes: Array<UserShape> }): void;
  setOneTeacherAddShape(s: S, p: { teacherShapes: Array<UserShape> }): void;
  setStudentDrawsLine(s: S, p: string): void;
  setStudentStrokes(s: S, p: Array<string>): void;
  setOneStudentStrokes(s: S, p: Array<string>): void;
  setOneStudentDrawsLine(s: S, p: string): void;
  setOneTeacherStrokes(s: S, p: Array<string>): void;
  setClearOneTeacherDrawsStrokes(s: S, p: {}): void;
  setClearOneStudentDrawsLine(s: S, p: {}): void;
  setClearOneStudentAddShape(s: S, p: {}): void;
  setClearOneTeacherAddShape(s: S, p: {}): void;
}

export interface AnnotationMutation<S> extends MutationTree<S>, AnnotationMutationInterface<S> {}

const mutations: AnnotationMutation<AnnotationState> = {
  setInfo(s: AnnotationState, p: AnnotationModel) {
    if (!p) return;
    s.pointer = p.pointer;
    s.mode = p.mode;
    if (p.drawing) {
      s.drawing = p.drawing;
      s.drawing.studentStrokes = p.drawing.studentBrushstrokes;
      s.drawing.teacherShapes = p.drawing.shapes;
      s.drawing.studentShapes = p.drawing.shapes;
      s.drawing.fabrics = p.drawing.fabrics;
    }
    if (p.oneOneDrawing) {
      s.oneToOne.fabrics = p.oneOneDrawing.fabrics;
      s.oneToOne = p.oneOneDrawing;
      s.oneToOne.studentStrokes = p.oneOneDrawing.studentBrushstrokes;
      s.oneToOne.teacherShapes = p.oneOneDrawing.shapes;
      s.oneToOne.studentShapes = p.oneOneDrawing.shapes;
    }
    s.stickers = p.stickers;
  },
  setPointer(s: AnnotationState, p: Pointer) {
    s.pointer = p;
  },
  setMode(s: AnnotationState, p: { mode: number }) {
    s.mode = p.mode;
  },
  addShape(s: AnnotationState, p: string) {
    if (p) {
      s.drawing.brushstrokes = [...s.drawing.brushstrokes, p];
    } else {
      s.drawing.brushstrokes = [];
    }
  },
  setTeacherBrushes(s: AnnotationState, p: Array<string>) {
    s.drawing.brushstrokes = p;
  },
  setOneTeacherStrokes(s: AnnotationState, p: Array<string>) {
    s.oneToOne.brushstrokes = p;
  },
  setOneTeacherDrawsStrokes(s: AnnotationState, p: string) {
    if (p) {
      s.oneToOne.brushstrokes = [...s.oneToOne.brushstrokes, p];
    } else {
      s.oneToOne.brushstrokes = [];
    }
  },
  setClearOneTeacherDrawsStrokes(s: AnnotationState, p: {}) {
    s.oneToOne.brushstrokes = [];
  },
  setClearBrush(s: AnnotationState, p: any) {
    s.drawing = {
      pencil: null,
      brushstrokes: [],
      studentShapes: [],
      teacherShapes: [],
      studentStrokes: [],
      fabrics: [],
    };
    s.oneToOne = {
      pencil: null,
      brushstrokes: [],
      studentShapes: [],
      teacherShapes: [],
      studentStrokes: [],
      fabrics: [],
    };
  },
  setDeleteBrush(s: AnnotationState, p: {}) {
    s.drawing.brushstrokes.pop();
    const itemRemove = s.pencilPath.pop();
    if (itemRemove?.lineIdRelated) {
      s.pencilPath = s.pencilPath
        .filter((item) => item.lineIdRelated !== itemRemove?.lineIdRelated)
        .filter((item) => item.id !== itemRemove?.lineIdRelated);
    } else {
      s.pencilPath = [...s.pencilPath];
    }
    s.drawing.brushstrokes = [...s.drawing.brushstrokes];
  },
  setDeleteBrushOneOne(s: AnnotationState, p: {}) {
    s.oneToOne.brushstrokes.pop();
    const itemRemove = s.pencilPath.pop();
    if (itemRemove?.lineIdRelated) {
      s.pencilPath = s.pencilPath
        .filter((item) => item.lineIdRelated !== itemRemove?.lineIdRelated)
        .filter((item) => item.id !== itemRemove?.lineIdRelated);
    } else {
      s.pencilPath = [...s.pencilPath];
    }
    s.oneToOne.brushstrokes = [...s.oneToOne.brushstrokes];
  },
  setStickers(s: AnnotationState, p: { stickers: Array<Sticker> }) {
    s.stickers = p.stickers;
  },
  setClearStickers(s: AnnotationState, p: {}) {
    s.stickers = [];
  },
  setStudentAddShape(s: AnnotationState, p: { studentShapes: Array<UserShape> }) {
    s.drawing.studentShapes = p.studentShapes;
  },
  setOneStudentAddShape(s: AnnotationState, p: { studentShapes: Array<UserShape> }) {
    s.oneToOne.studentShapes = p.studentShapes;
  },
  setClearOneStudentAddShape(s: AnnotationState, p: {}) {
    s.oneToOne.studentShapes = [];
  },
  setTeacherAddShape(s: AnnotationState, p: { teacherShapes: Array<UserShape> }) {
    s.drawing.teacherShapes = p.teacherShapes;
  },
  setOneTeacherAddShape(s: AnnotationState, p: { teacherShapes: Array<UserShape> }) {
    s.oneToOne.teacherShapes = p.teacherShapes;
  },
  setClearOneTeacherAddShape(s: AnnotationState, p: {}) {
    s.oneToOne.teacherShapes = [];
  },
  setStudentDrawsLine(s: AnnotationState, p: string) {
    if (p) {
      s.drawing.studentStrokes = [...s.drawing.studentStrokes, p];
    } else {
      s.drawing.studentStrokes = [];
    }
  },
  setStudentStrokes(s: AnnotationState, p: Array<string>) {
    s.drawing.studentStrokes = p;
  },
  setOneStudentStrokes(s: AnnotationState, p: Array<string>) {
    s.oneToOne.studentStrokes = p;
  },
  setOneStudentDrawsLine(s: AnnotationState, p: string) {
    if (p) {
      s.oneToOne.studentStrokes = [...s.oneToOne.studentStrokes, p];
    } else {
      s.oneToOne.studentStrokes = [];
    }
  },
  setClearOneStudentDrawsLine(s: AnnotationState, p: {}) {
    s.oneToOne.studentStrokes = [];
  },
  setLastFabricUpdated(s: AnnotationState, p: LastFabricUpdated | null) {
    s.lastFabricUpdated = p;
  },
  setFabricsInDrawing(s: AnnotationState, p: FabricObject[]) {
    s.drawing.fabrics = p;
  },
  setFabricsInOneMode(s: AnnotationState, p: FabricObject[]) {
    s.oneToOne.fabrics = p;
  },
  setImgDimension(state: AnnotationState, p: { width?: number; height?: number }) {
    state.imgWidth = p.width;
    state.imgHeight = p.height;
  },
  setImgRenderSize(state: AnnotationState, p: { width?: number; height?: number }) {
    state.imgRenderWidth = p.width;
    state.imgRenderHeight = p.height;
  },
  setImgProcessing(state: AnnotationState, p: boolean) {
    state.isImgProcessing = p;
  },
  setDrawPencil(state: AnnotationState, payload: any) {
    const index = state.pencilPath.findIndex((item) => item.id === payload.id);
    if (!state.pencilPath.length || index < 0) {
      if (state.pencilPath.length && !state.pencilPath[state.pencilPath.length - 1].isDone) {
        state.pencilPath[state.pencilPath.length - 1].isDone = true;
      }
      state.pencilPath.push({
        ...payload,
        points: [...payload.pointsSkipped, payload.points],
        strokeColor: payload.strokeColor,
        strokeWidth: payload.strokeWidth,
        isDone: payload.isDone,
        ratio: payload.ratio,
        lineIdRelated: payload.lineIdRelated,
      });
    } else if (index >= 0) {
      state.pencilPath[index] = {
        ...state.pencilPath[index],
        points: [...state.pencilPath[index].points, ...payload.pointsSkipped, payload.points],
        isDone: payload.isDone,
      };
    }
  },
  clearPencilPath(state: AnnotationState) {
    state.pencilPath = [];
  },
  setFabricObjects(state: AnnotationState, payload: FabricObject) {
    const existingObject = state.drawing.fabrics.find((item) => item.fabricId === payload.fabricId);
    if (!state.drawing.fabrics.length || !existingObject) {
      state.drawing.fabrics.push(payload);
    } else {
      if (existingObject) {
        existingObject.fabricData = payload.fabricData;
      }
    }
  },
  setOneToOneFabricObjects(state: AnnotationState, payload: FabricObject) {
    const existingObject = state.oneToOne.fabrics.find((item) => item.fabricId === payload.fabricId);
    if (!state.oneToOne.fabrics.length || !existingObject) {
      state.oneToOne.fabrics.push(payload);
    } else {
      if (existingObject) {
        existingObject.fabricData = payload.fabricData;
      }
    }
  },
  setDeleteFabric(state: AnnotationState) {
    state.drawing.fabrics.pop();
    state.drawing.fabrics = [...state.drawing.fabrics];
    state.lastFabricUpdated = null;
  },
  setDeleteOneToOneFabric(state: AnnotationState) {
    state.oneToOne.fabrics.pop();
    state.oneToOne.fabrics = [...state.oneToOne.fabrics];
    state.lastFabricUpdated = null;
  },
  setDeleteShape(state: AnnotationState, payload: string) {
    const userShapes = state.drawing.teacherShapes.filter((item) => item.userId === payload);
    const lastItem = userShapes[userShapes.length - 1];
    lastItem.brushstrokes.pop();
    lastItem.brushstrokes = [...lastItem.brushstrokes];
    if (!lastItem.brushstrokes.length) {
      state.drawing.teacherShapes = state.drawing.teacherShapes.filter((item) => item.userId !== lastItem.userId);
    }
  },
  setDeleteOneToOneShape(state: AnnotationState, payload: string) {
    const userShapes = state.oneToOne.teacherShapes.filter((item) => item.userId === payload);
    const lastItem = userShapes[userShapes.length - 1];
    lastItem.brushstrokes.pop();
    lastItem.brushstrokes = [...lastItem.brushstrokes];
    if (!lastItem.brushstrokes.length) {
      state.oneToOne.teacherShapes = state.oneToOne.teacherShapes.filter((item) => item.userId !== lastItem.userId);
    }
  },
};

export default mutations;
