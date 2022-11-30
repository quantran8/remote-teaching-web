import { AnnotationModel } from "@/models";
import { FabricObject } from "@/ws";
import { ActionContext, ActionTree } from "vuex";
import { AnnotationState, LastFabricUpdated, Pointer, Sticker, UserShape } from "./state";

export interface AnnotationActionInterface<S, R> {
  setInfo(s: ActionContext<S, R>, p: AnnotationModel): void;
  setPointer(s: ActionContext<S, R>, p: Pointer): void;
  setMode(s: ActionContext<S, R>, p: { mode: number }): void;
  addShape(s: ActionContext<S, R>, p: string): void;
  setTeacherBrushes(s: ActionContext<S, R>, p: Array<string>): void;
  setOneTeacherStrokes(s: ActionContext<S, R>, p: Array<string>): void;
  setClearBrush(s: ActionContext<S, R>, p: {}): void;
  setDeleteBrush(s: ActionContext<S, R>, p: {}): void;
  setStickers(s: ActionContext<S, R>, p: { stickers: Array<Sticker> }): void;
  setClearStickers(s: ActionContext<S, R>, p: {}): void;
  setStudentAddShape(s: ActionContext<S, R>, p: { studentShapes: Array<UserShape> }): void;
  setTeacherAddShape(s: ActionContext<S, R>, p: { teacherShapes: Array<UserShape> }): void;
  setStudentDrawsLine(s: ActionContext<S, R>, p: string): void;
  setStudentStrokes(s: ActionContext<S, R>, p: Array<string>): void;
  setOneStudentStrokes(s: ActionContext<S, R>, p: Array<string>): void;
  setClearOneTeacherDrawsStrokes(s: ActionContext<S, R>, p: {}): void;
  setClearOneStudentDrawsLine(s: ActionContext<S, R>, p: {}): void;
}

export interface AnnotationAction<S, R> extends ActionTree<S, R>, AnnotationActionInterface<S, R> {}

const actions: ActionTree<AnnotationState, any> = {
  setInfo({ commit }, p: AnnotationModel) {
    commit("setInfo", p);
  },
  setPointer({ commit }, p: Pointer) {
    commit("setPointer", p);
  },
  setMode({ commit }, p: { mode: number }) {
    commit("setMode", p);
  },
  addShape({ commit, rootGetters }, p: string) {
    if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setOneTeacherDrawsStrokes", p);
    } else if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setOneTeacherDrawsStrokes", p);
    } else {
      commit("addShape", p);
    }
  },
  setTeacherBrushes({ commit }, p: Array<string>) {
    commit("setTeacherBrushes", p);
  },
  setOneTeacherStrokes({ commit }, p: Array<string>) {
    commit("setOneTeacherStrokes", p);
  },
  setClearBrush({ commit }, p: {}) {
    commit("setClearBrush", p);
  },
  setDeleteBrush({ commit, rootGetters }, p: {}) {
    if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setDeleteBrushOneOne", p);
    } else if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setDeleteBrushOneOne", p);
    } else {
      commit("setDeleteBrush", p);
    }
  },
  setStickers({ commit }, p: { stickers: Array<Sticker> }) {
    commit("setStickers", p);
  },
  setClearStickers({ commit }, p: {}) {
    commit("setClearStickers", p);
  },
  setStudentAddShape({ commit, rootGetters }, p: { studentShapes: Array<UserShape> }) {
    if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setOneStudentAddShape", p);
    } else if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setOneStudentAddShape", p);
    } else {
      commit("setStudentAddShape", p);
    }
  },
  setTeacherAddShape({ commit, rootGetters }, p: { teacherShapes: Array<UserShape> }) {
    if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setOneTeacherAddShape", p);
    } else if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setOneTeacherAddShape", p);
    } else {
      commit("setTeacherAddShape", p);
    }
  },
  setStudentDrawsLine({ commit, rootGetters }, p: string) {
    if (rootGetters["teacherRoom/getStudentModeOneId"]) {
      commit("setOneStudentDrawsLine", p);
    } else if (rootGetters["studentRoom/getStudentModeOneId"]) {
      commit("setOneStudentDrawsLine", p);
    } else {
      commit("setStudentDrawsLine", p);
    }
  },
  setStudentStrokes({ commit }, p: Array<string>) {
    commit("setStudentStrokes", p);
  },
  setOneStudentStrokes({ commit }, p: Array<string>) {
    commit("setOneStudentStrokes", p);
  },
  setClearOneTeacherDrawsStrokes({ commit }, p: {}) {
    commit("setClearOneTeacherDrawsStrokes", p);
  },
  setClearOneStudentDrawsLine({ commit }, p: {}) {
    commit("setClearOneStudentDrawsLine", p);
  },
  setLastFabricUpdated({ commit }, p: LastFabricUpdated) {
    commit("setLastFabricUpdated", p);
  },
  setFabricsInDrawing({ commit }, p: FabricObject[]) {
    commit("setFabricsInDrawing", p);
  },
  setFabricsInOneMode({ commit }, p: FabricObject[]) {
    commit("setFabricsInOneMode", p);
  },
  setImgDimension({ commit }, payload: { width?: number; height?: number }) {
    commit("setImgDimension", payload);
  },
  setImgRenderSize({ commit }, payload: { width?: number; height?: number }) {
    commit("setImgRenderSize", payload);
  },
  setImgProcessing({ commit }, payload: boolean) {
    commit("setImgProcessing", payload);
  },
  setDrawPencil({ commit, rootState }, payload: string) {
    commit("setDrawPencil", { ...JSON.parse(payload), ratio: rootState.lesson.zoomRatio });
  },
  clearPencilPath({ commit }) {
    commit("clearPencilPath");
  },
};
export default actions;
