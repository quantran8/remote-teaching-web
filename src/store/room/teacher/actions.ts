import { AgoraEventHandler } from "@/agora";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import {
  LessonService,
  RemoteTeachingService,
  TeacherGetRoomResponse,
} from "@/services";
import { ActionTree } from "vuex";
import {
  ClassViewPayload,
  DefaultPayload,
  DeviceMediaPayload,
  InClassStatus,
  InitClassRoomPayload,
  StudentBadgePayload,
  UserIdPayload,
  UserMediaPayload,
  ValueOfClassView,
} from "../interface";
import { TeacherRoomState } from "./state";
import { useTeacherRoomWSHandler } from "./handler";
import { RoomModel } from "@/models";
import { Logger } from "@/utils/logger";
const actions: ActionTree<TeacherRoomState, any> = {
  setDesignatingTarget({ commit }, p: { isDesignatingTarget: boolean }) {
    commit("setDesignatingTarget", p);
  },
  async endClass({ commit, state }, payload: DefaultPayload) {
    if (state.info) {
      await state.manager?.WSClient.sendRequestEndRoom(state.info?.id);
    }
    commit("endClass", payload);
  },
  setClassView({ state }, payload: ClassViewPayload) {
    const focusTab = ValueOfClassView(payload.classView);
    state.manager?.WSClient.sendRequestSetFocusTab(focusTab);
  },
  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  setError(store, payload: GLError | null) {
    store.commit("setError", payload);
  },
  async updateAudioAndVideoFeed({ state }) {
    const { globalAudios, localAudios, manager, students } = state;
    if (!manager) return;
    const cameras = students
      .filter((s) => s.videoEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
    let audios = students
      .filter((s) => s.audioEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
    if (localAudios.length > 0) {
      audios = [...localAudios];
    } else if (globalAudios.length > 0) {
      audios = [...globalAudios];
    }
    return manager?.updateAudioAndVideoFeed(cameras, audios);
  },
  async leaveRoom({ state }, _payload: any) {
    return state.manager?.close();
  },
  async joinRoom(store, _payload: any) {
    const { state, dispatch } = store;
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
      onUserPublished: (_user, _mediaType) => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onUserUnPublished: (_payload) => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onException: (payload: any) => {
        Logger.error("Exception", payload);
      },
    };
    state.manager?.registerAgoraEventHandler(agoraEventHandler);
  },
  async initClassRoom({ commit }, payload: InitClassRoomPayload) {
    commit("setUser", { id: payload.userId, name: payload.userName });
    let roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    if (!roomResponse) {
      // start class room
      // const lessons = await LessonService.getLessonByUnit(11);
      // let lesson = lessons.find((ele) => parseInt(ele.title) === 16);
      // if (!lesson) lesson = lessons[0];
      roomResponse = await RemoteTeachingService.teacherStartClassRoom(
        payload.classId,
        payload.classId
      );
      if (!roomResponse) throw new Error("Can not start class");
    }
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
  async setStudentAudio({ state, commit }, payload: UserMediaPayload) {
    await state.manager?.WSClient.sendRequestMuteStudentAudio(
      payload.id,
      !payload.enable
    );
    commit("setStudentAudio", payload);
  },
  async setStudentVideo({ state, commit }, payload: UserMediaPayload) {
    commit("setStudentVideo", payload);
    state.manager?.WSClient.sendRequestMuteStudentVideo(
      payload.id,
      !payload.enable
    );
  },
  setStudentBadge({ state }, payload: StudentBadgePayload) {
    state.manager?.WSClient.sendRequestSetStudentBadge(
      payload.id,
      payload.badge
    );
  },

  async setTeacherAudio({ state, commit }, payload: DeviceMediaPayload) {
    if (state.microphoneLock) return;
    commit("setMicrophoneLock", { enable: true });
    await state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
    await state.manager?.setMicrophone({ enable: payload.enable });
    commit("setTeacherAudio", payload);
    commit("setMicrophoneLock", { enable: false });
  },

  async setTeacherVideo({ state, commit }, payload: DeviceMediaPayload) {
    if (state.cameraLock) return;
    commit("setCameraLock", { enable: true });
    await state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
    await state.manager?.setCamera({ enable: payload.enable });
    commit("setTeacherVideo", payload);
    commit("setCameraLock", { enable: false });
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
  studentJoinned(store, payload: UserIdPayload) {
    store.commit("studentJoinned", payload);
  },
  studentLeftClass(store, payload: UserIdPayload) {
    store.commit("studentLeftClass", payload);
  },
  studentLeaving(store, payload: UserIdPayload) {
    store.commit("studentLeaving", payload);
  },
  studentRaisingHand(store, payload: { id: string; raisingHand: boolean }) {
    store.commit("studentRaisingHand", payload);
  },
  addGlobalAudio({ state }, payload: UserIdPayload) {
    state.manager?.WSClient.sendRequestAddGlobalAudio(payload.id);
  },
  clearGlobalAudio({ state }, _payload: any) {
    state.manager?.WSClient.sendRequestClearGlobalAudio();
  },
  addStudentAudio({ state }, payload: UserIdPayload) {
    state.manager?.WSClient.sendRequestAddStudentAudio(payload.id);
  },
  clearStudentAudio({ state }, _payload: any) {
    state.manager?.WSClient.sendRequestClearStudentAudio();
  },
  setBlackOut({ state }, payload: { isBlackOut: boolean }) {
    state.manager?.WSClient.sendRequestBlackOutLessonContent(
      payload.isBlackOut
    );
  },
  setCurrentExposure({ state }, payload: { id: string }) {
    state.manager?.WSClient.sendRequestStartLessonContent(payload.id);
  },
  endExposure({ state }, payload: { id: string }) {
    state.manager?.WSClient.sendRequestEndLessonContent(payload.id);
  },
  setCurrentExposureMediaItem({ state }, payload: { id: string }) {
    state.manager?.WSClient.sendRequestSetLessonItemContent(payload.id);
  },
  clearStudentRaisingHand({ state }, payload: { id: string }) {
    const student = state.students.find(
      (e) => e.id === payload.id && e.raisingHand
    );
    if (student)
      state.manager?.WSClient.sendRequestClearRaisingHand(payload.id);
  },
  setClassAction({ state }, payload: { action: number }) {
    state.manager?.WSClient.sendRequestSetClassAction(payload.action);
  },
};

export default actions;
