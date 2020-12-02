import { RoomModel, StudentModel } from "@/models";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { WSEventHandler } from "@/ws";
import { ActionTree } from "vuex";
import { ClassView, ValueOfClassView } from "../interface";
import { TeacherRoomState } from "./state";

const actions: ActionTree<TeacherRoomState, any> = {
  async endClass({ commit, state }, payload: any) {
    await RemoteTeachingService.teacherEndClassRoom(state.info?.id);
    // await state.manager?.sendRequestEndClass();
    commit("endClass", payload);
  },
  setClassView({ commit, state }, payload: { classView: ClassView }) {
    commit("setClassView", payload);
    state.manager?.WSClient.sendRequestSetFocusTab(
      ValueOfClassView(payload.classView)
    );
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
  async joinRoom({ state, commit }, _payload: any) {
    if (!state.info || !state.teacher || !state.manager) return;
    await state.manager?.join({
      camera: state.teacher.videoEnabled,
      microphone: state.teacher.audioEnabled,
      classId: state.info.id,
      teacherId: state.user?.id,
    });
    state.manager?.WSClient.sendRequestJoinRoom(state.info.id);

    const eventHandler: WSEventHandler = {
      onStudentJoinClass: (payload: any) => {
        console.log(payload);
      },
      onStudentStreamConnect: (payload: any) => {
        console.log(payload);
      },
      onStudentMuteAudio: (payload: any) => {
        console.log(payload);
      },
      onStudentMuteVideo: (payload: StudentModel) => {
        console.log(payload);
        commit("setStudentVideo", {
          studentId: payload.id,
          videoEnabled: !payload.isMuteVideo,
        });
      },
      onStudentLeave: (payload: any) => {
        console.log(payload);
      },
      onStudentDisconnected: (payload: any) => {
        console.log(payload);
      },

      onTeacherJoinClass: (payload: any) => {
        console.log(payload);
      },
      onTeacherStreamConnect: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteVideo: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteStudentVideo: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteStudentAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteAllStudentVideo: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteAllStudentAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherEndClass: (payload: any) => {
        console.log(payload);
      },
      onTeacherDisconnect: (payload: any) => {
        console.log(payload);
      },
      onTeacherSetFocusTab: (payload: any) => {
        console.log(payload);
      },
    };

    state.manager?.registerEventHandler(eventHandler);
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
        message: "Your class has not been started!",
      });
      return;
    }
    commit("setRoomInfo", roomResponse.data);
  },

  setStudentAudio(
    { state, commit },
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    commit("setStudentAudio", payload);
    state.manager?.WSClient.sendRequestMuteStudentAudio(
      payload.studentId,
      !payload.audioEnabled
    );
  },
  setStudentVideo(
    { state, commit },
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    commit("setStudentVideo", payload);
    state.manager?.WSClient.sendRequestMuteStudentVideo(
      payload.studentId,
      !payload.videoEnabled
    );
  },
  setStudentBadge(store, payload: { studentId: string; badge: number }) {
    store.commit("setStudentBadge", payload);
  },

  setTeacherAudio(
    { state, commit },
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    commit("setTeacherAudio", payload);
    state.manager?.WSClient.sendRequestMuteAudio(!payload.audioEnabled);
  },

  setTeacherVideo(
    { state, commit },
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    commit("setTeacherVideo", payload);
    state.manager?.WSClient.sendRequestMuteVideo(!payload.videoEnabled);
  },
  hideAllStudents({ commit, state }) {
    commit("hideAllStudents", {});
    state.manager?.WSClient.sendRequestMuteAllStudentVideo(true);
  },
  showAllStudents({ state, commit }) {
    commit("showAllStudents", {});
    state.manager?.WSClient.sendRequestMuteAllStudentVideo(false);
  },
  muteAllStudents({ commit, state }) {
    commit("muteAllStudents", {});
    state.manager?.WSClient.sendRequestMuteAllStudentAudio(true);
  },
  unmuteAllStudents({ state, commit }) {
    commit("unmuteAllStudents", {});
    state.manager?.WSClient.sendRequestMuteAllStudentAudio(false);
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
