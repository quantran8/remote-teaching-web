// import { MutationTree } from "vuex";
// import { UnityState } from "./state";
//
// export interface UnityMutationInterface<S> {
//   setTeacherMessage(s: S, p: { message: string }): void;
//   setStudentMessage(s: S, p: { message: string }): void;
// }
//
// export interface UnityMutation<S>
//   extends MutationTree<S>,
//     UnityMutationInterface<S> {}
//
// const mutations: UnityMutation<UnityState> = {
//   setTeacherMessage(s: UnityState, p: { message: string }) {
//     s.messageTeacher = p.message;
//   },
//   setStudentMessage(s: UnityState, p: { message: string }) {
//     s.messageStudent = p.message;
//   },
// };
//
// export default mutations;
