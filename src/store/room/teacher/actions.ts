import { RoomModel } from "@/models";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { ActionTree } from "vuex";
import { ClassView } from "../interface";
import { TeacherRoomState } from "./state";

const actions: ActionTree<TeacherRoomState, any> = {
  async endClass({ commit, state }, payload: any) {
    await RemoteTeachingService.teacherEndClassRoom(state.info?.id);
    commit("endClass", payload);
  },
  setClassView(store, payload: { classView: ClassView }) {
    store.commit("setClassView", payload);
  },
  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  setError(store, payload: GLError | null) {
    store.commit("setError", payload);
  },
  async leaveRoom({ state }, _payload: any) {
    return state.manager?.close();
  },
  async joinRoom({ state }, _payload: any) {
    if (!state.info || !state.teacher || !state.manager) return;
    state.manager?.join({
      camera: state.teacher.videoEnabled,
      microphone: state.teacher.audioEnabled,
      publish: state.teacher.audioEnabled,
    });
  },
  async initClassRoom(
    { commit },
    payload: {
      classId: string;
      userId: string;
      userName: string;
      role: string;
    }
  ) {
    commit("setUser", {
      id: payload.userId,
      name: payload.userName,
    });

    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    if (!roomResponse) return;
    const roomInfo: RoomModel = roomResponse.data;
    if (!roomInfo || roomInfo.classId !== payload.classId) {
      commit("setError", {
        errorCode: GLErrorCode.CLASS_IS_NOT_ACTIVE,
        message: "This class is not active!",
      });
      return;
    }
    commit("setRoomInfo", roomResponse.data);
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
