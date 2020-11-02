import { MutationTree } from "vuex";
import { ClassState } from "./state";

const mutations: MutationTree<ClassState> = {
  setClassView(state: ClassState, payload: { view: number }) {
    state.view = payload.view;
  },

  setStudentAudio(
    state: ClassState,
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.audioEnabled = payload.audioEnabled;
  },
  setStudentVideo(
    state: ClassState,
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.videoEnabled = payload.videoEnabled;
  },
  setStudentBadge(
    state: ClassState,
    payload: { studentId: string; badge: number }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.badge = payload.badge;
  },

  setTeacherAudio(
    state: ClassState,
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    if (state.teacher.id === payload.teacherId)
      state.teacher.audioEnabled = payload.audioEnabled;
  },
  setTeacherVideo(
    state: ClassState,
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    if (state.teacher.id === payload.teacherId)
      state.teacher.videoEnabled = payload.videoEnabled;
  },
};

export default mutations;
