// import { ActionContext, ActionTree } from "vuex";
// import { UnityState } from "./state";
//
// export interface UnityActionInterface<S, R> {
//   setTeacherMessage(s: ActionContext<S, R>, p: { message: string}): void;
//   setStudentMessage(s: ActionContext<S, R>, p: { message: string}): void;
// }
//
// export interface UnityAction<S, R>
//   extends ActionTree<S, R>,
//     UnityActionInterface<S, R> {}
//
// const actions: ActionTree<UnityState, any> = {
//   setTeacherMessage({ commit }, p: { message: string }) {
//     commit("setTeacherMessage", p);
//   },
//   setStudentMessage({ commit }, p: { message: string }) {
//     commit("setStudentMessage", p);
//   },
// };
// export default actions;
