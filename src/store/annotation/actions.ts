import { AnnotationModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import { AnnotationState, Pointer, Sticker, UserShape } from "./state";

export interface AnnotationActionInterface<S, R> {
  setPointer(s: ActionContext<S, R>, p: Pointer): void;
  setMode(s: ActionContext<S, R>, p: { mode: number }): void;
  addShape(s: ActionContext<S, R>, p: string): void;
  setClearBrush(s: ActionContext<S, R>, p: {}): void;
  setDeleteBrush(s: ActionContext<S, R>, p: {}): void;
  setStickers(s: ActionContext<S, R>, p: { stickers: Array<Sticker> }): void;
  setClearStickers(s: ActionContext<S, R>, p: {}): void;
  setStudentAddShape(s: ActionContext<S, R>, p: { studentShapes: Array<UserShape> }): void;
  setTeacherAddShape(s: ActionContext<S, R>, p: { teacherShapes: Array<UserShape> }): void;
  setStudentDrawsLine(s: ActionContext<S, R>, p: string): void;
  setClearOneTeacherDrawsStrokes(s: ActionContext<S, R>, p: {}): void;
  setClearOneStudentDrawsLine(s: ActionContext<S, R>, p: {}): void;
  setInfo(s: ActionContext<S, R>, p: AnnotationModel): void;
}

export interface AnnotationAction<S, R> extends ActionTree<S, R>, AnnotationActionInterface<S, R> {}

const actions: ActionTree<AnnotationState, any> = {
  setPointer({ commit }, p: Pointer) {
    commit("setPointer", p);
  },
  setMode({ commit }, p: { mode: number }) {
    commit("setMode", p);
  },
  addShape({ commit, rootGetters }, p: string) {
    if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setOneTeacherDrawsStrokes", p);
    } else {
      commit("addShape", p);
    }
  },
  setClearBrush({ commit }, p: {}) {
    commit("setClearBrush", p);
  },
  setDeleteBrush({ commit }, p: {}) {
    commit("setDeleteBrush", p);
  },
  setStickers({ commit }, p: { stickers: Array<Sticker> }) {
    commit("setStickers", p);
  },
  setClearStickers({ commit }, p: {}) {
    commit("setClearStickers", p);
  },
  setStudentAddShape({ commit }, p: { studentShapes: Array<UserShape> }) {
    commit("setStudentAddShape", p);
  },
  setTeacherAddShape({ commit }, p: { teacherShapes: Array<UserShape> }) {
    commit("setTeacherAddShape", p);
  },
  setStudentDrawsLine({ commit, rootGetters }, p: string) {
    if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setOneStudentDrawsLine", p);
    } else {
      commit("setStudentDrawsLine", p);
    }
  },
  setClearOneTeacherDrawsStrokes({ commit }, p: {}) {
    commit("setClearOneTeacherDrawsStrokes", p);
  },
  setClearOneStudentDrawsLine({ commit }, p: {}) {
    commit("setClearOneStudentDrawsLine", p);
  },
  setInfo({ commit }, p: AnnotationModel) {
    commit("setInfo", p);
  },
};
export default actions;
