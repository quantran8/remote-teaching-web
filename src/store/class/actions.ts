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
};

export default actions;
