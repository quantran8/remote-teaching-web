import { AnnotationModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

export interface AnnotationActionInterface<S, R> {
  setPointer(s: ActionContext<S, R>, p: Pointer): void;
  setMode(s: ActionContext<S, R>, p: { mode: number }): void;
  setBrush(s: ActionContext<S, R>, p: { drawing: Array<string> }): void;
  setInfo(s: ActionContext<S, R>, p: AnnotationModel): void;
}

export interface AnnotationAction<S, R>
  extends ActionTree<S, R>,
    AnnotationActionInterface<S, R> {}

const actions: ActionTree<AnnotationState, any> = {
  setPointer({ commit }, p: Pointer) {
    commit("setPointer", p);
  },
  setMode({ commit }, p: { mode: number }) {
    commit("setMode", p);
  },
  setBrush({ commit }, p: { drawing: Array<string> }) {
    commit("setBrush", p);
  },
  setInfo({ commit }, p: AnnotationModel) {
    commit("setInfo", p);
  }
};
export default actions;
