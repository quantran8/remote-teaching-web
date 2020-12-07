import { AgoraEventHandler } from "@/agora";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { ActionTree } from "vuex";
import { ClassView, ValueOfClassView } from "../interface";
import { TeacherRoomState } from "./state";
import { useTeacherRoomWSHandler } from "./handler";
import { RoomModel } from "@/models";
import { Logger } from "@/utils/logger";

const actions: ActionTree<TeacherRoomState, any> = {
  async endClass({ commit, state }, payload: any) {
    if (state.info) {
      await state.manager?.WSClient.sendRequestEndRoom(state.info?.id);
      await RemoteTeachingService.teacherEndClassRoom(state.info?.id);
    }
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

  async updateAudioAndVideoFeed({ state }) {
    const { globalAudios, localAudios, manager } = state;
    manager?.subcriseRemoteUsers(localAudios, globalAudios);
  },
  async leaveRoom({ state }, _payload: any) {
    return state.manager?.close();
  },
  async joinRoom(store, _payload: any) {
    const { state } = store;
    if (!state.info || !state.teacher || !state.manager) return;
    await state.manager?.join({
      camera: state.teacher.videoEnabled,
      microphone: state.teacher.audioEnabled,
      classId: state.info.id,
      teacherId: state.user?.id,
    });
    state.manager?.WSClient.sendRequestJoinRoom(state.info.id);
    const eventHandler = useTeacherRoomWSHandler(store);
    state.manager?.registerEventHandler(eventHandler);
    const agoraEventHandler: AgoraEventHandler = {
      onUserPublished: (user, mediaType) => {
        console.log(user, mediaType);
      },
    };
    state.manager?.registerAgoraEventHandler(agoraEventHandler);
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
  setStudentBadge(
    { commit, state },
    payload: { studentId: string; badge: number }
  ) {
    commit("setStudentBadge", payload);
    state.manager?.WSClient.sendRequestSetStudentBadge(
      payload.studentId,
      payload.badge
    );
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
    store.commit("studentLeftClass", payload);
  },
  studentLeaving(store, payload: { studentId: string }) {
    store.commit("studentLeaving", payload);
  },
  addGlobalAudio({ commit, state }, payload: { studentId: string }) {
    commit("addGlobalAudio", payload);
    state.manager?.WSClient.sendRequestAddGlobalAudio(payload.studentId);
  },
  clearGlobalAudio({ commit, state }, payload: any) {
    commit("clearGlobalAudio", payload);
    state.manager?.WSClient.sendRequestClearGlobalAudio();
  },
  addStudentAudio({ commit, state }, payload: { studentId: string }) {
    commit("addStudentAudio", payload);
    state.manager?.WSClient.sendRequestAddStudentAudio(payload.studentId);
  },
  clearStudentAudio({ commit, state }, payload: any) {
    commit("clearStudentAudio", payload);
    state.manager?.WSClient.sendRequestClearStudentAudio();
  },
};

export default actions;
