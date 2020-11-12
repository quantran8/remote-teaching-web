import { ActionTree } from "vuex";
import { ClassState } from "./state";

const actions: ActionTree<ClassState, any> = {
  setClassView(store, payload: { view: number }) {
    store.commit("setClassView", payload);
  },

  setStudentAudio(
    store,
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    store.commit("setStudentAudio", payload);
  },
  setStudentVideo(
    store,
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    store.commit("setStudentVideo", payload);
  },
  setStudentBadge(store, payload: { studentId: string; badge: number }) {
    store.commit("setStudentBadge", payload);
  },

  setTeacherAudio(
    store,
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    store.commit("setTeacherAudio", payload);
  },
  setTeacherVideo(
    store,
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    store.commit("setTeacherVideo", payload);
  },
  hideAllStudents(store) {
    store.commit("hideAllStudents", {});
  },
  showAllStudents(store) {
    store.commit("showAllStudents", {});
  },
  muteAllStudents(store) {
    store.commit("muteAllStudents", {});
  },
  unmuteAllStudents(store) {
    store.commit("unmuteAllStudents", {});
  },
  studentJoinned(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
  studentLeftClass(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
  studentLeaving(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
};

export default actions;
