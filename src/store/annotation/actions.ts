import { AnnotationModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import { AnnotationState, Pointer } from "./state";

export interface AnnotationActionInterface<S, R> {
  setPointer(s: ActionContext<S, R>, p: Pointer): void;
  setInfo(s: ActionContext<S, R>, p: AnnotationModel): void;
}

export interface AnnotationAction<S, R>
  extends ActionTree<S, R>,
    AnnotationActionInterface<S, R> {}

const actions: ActionTree<AnnotationState, any> = {
  setPointer({ commit }, p: Pointer) {
    commit("setPointer", p);
  },
  setInfo({ commit }, p: AnnotationModel) {
    commit("setInfo", p);
  }
};
export default actions;
