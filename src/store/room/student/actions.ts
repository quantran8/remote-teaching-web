import { RoomModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { RemoteTeachingService, StudentGetRoomResponse, TeacherGetRoomResponse } from "@/services";
import { ActionTree } from "vuex";
import { ClassViewFromValue, ClassViewPayload, InClassStatus } from "../interface";
import { useStudentRoomHandler } from "./handler";
import { StudentRoomState } from "./state";
import { UID } from "agora-rtc-sdk-ng";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";
import {ErrorCode} from "commonui";
import router from "@/router";
import {Paths} from "@/utils/paths";

const actions: ActionTree<StudentRoomState, any> = {
  async initClassRoom(
    { commit, dispatch },
    payload: {
      classId: string;
      userId: string;
      userName: string;
      studentId: string;
      role: string;
      browserFingerPrinting: string;
    },
  ) {
    commit("setUser", {
      id: payload.studentId,
      name: payload.userName,
    });
    try {
      const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(payload.studentId, payload.browserFingerPrinting);
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
      commit("setClassView", {
        classView: ClassViewFromValue(roomResponse.data.focusTab),
      });
      commit("setWhiteboard", roomResponse.data.isShowWhiteBoard);
    } catch (error) {
      if (error.code === ErrorCode.ConcurrentUserException) {
        await dispatch("setToast", { message: error.message }, { root: true });
        await router.push(Paths.Home);
      } else {
        commit("setError", {
          errorCode: GLErrorCode.CLASS_IS_NOT_ACTIVE,
          message: "Your class has not been started!",
        });
        return;
      }
    }
  },

  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  async updateAudioAndVideoFeed({ state }) {
    const { globalAudios, manager, students, teacher, idOne, student } = state;
    if (!manager) return;
    const cameras = students.filter(s => s.videoEnabled && s.status === InClassStatus.JOINED).map(s => s.id);
    let audios = students.filter(s => s.audioEnabled && s.status === InClassStatus.JOINED).map(s => s.id);
    if (globalAudios.length > 0) {
      audios = globalAudios;
    }
    if (teacher) {
      if (teacher.videoEnabled && teacher.status === InClassStatus.JOINED) {
        cameras.push(teacher.id);
      }
      if (teacher.audioEnabled && teacher.status === InClassStatus.JOINED) {
        audios.push(teacher.id);
      }
    }
    if (idOne) {
      return manager?.oneToOneSubscribeAudio(cameras, audios, idOne, teacher, student);
    }
    return manager?.updateAudioAndVideoFeed(cameras, audios);
  },
  async joinWSRoom(store, _payload: any) {
    if (!store.state.info || !store.state.manager || !store.state.user) return;
    await store.state.manager?.WSClient.sendRequestJoinRoom(store.state.info.id, store.state.user.id, _payload.browserFingerPrinting);
    const eventHandler = useStudentRoomHandler(store);
    store.state.manager?.registerEventHandler(eventHandler);
  },
  async joinRoom(store, _payload: any) {
    const { state, dispatch } = store;
    if (!state.info || !state.user) return;
    if (!state.manager?.isJoinedRoom()) {
      await state.manager?.join({
        camera: state.student?.videoEnabled,
        microphone: state.student?.audioEnabled,
        classId: state.info?.id,
        studentId: state.user?.id,
      });
    }
    state.manager?.agoraClient.registerEventHandler({
      onUserPublished: _payload => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onUserUnPublished: () => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onException: (payload: any) => {
        // Logger.error("Exception", payload);
      },
      onVolumeIndicator(result: { level: number; uid: UID }[]) {
        // console.log("speaking", JSON.stringify(result));
        dispatch("setSpeakingUsers", result);
      },
      onLocalNetworkUpdate(payload: any) {
        // console.log("onLocalNetworkUpdate", payload);
      },
    });
  },
  setSpeakingUsers({ commit }, payload: { level: number; uid: UID }[]) {
    const validSpeakings: Array<string> = [];
    if (payload) {
      payload.map(item => {
        if (item.level >= MIN_SPEAKING_LEVEL) {
          // should check by a level
          validSpeakings.push(item.uid.toString());
        }
      });
    }
    commit("setSpeakingUsers", { userIds: validSpeakings });
  },
  async leaveRoom({ state, commit }, payload: any) {
    await state.manager?.close();
    commit("leaveRoom", payload);
  },
  async loadRooms({ commit, state }, _payload: any) {
    if (!state.user) return;
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(state.user.id, _payload);
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
  },
  async setStudentAudio({ commit, state }, payload: { id: string; enable: boolean }) {
    if (payload.id === state.student?.id) {
      if (state.microphoneLock) return;
      commit("setMicrophoneLock", { enable: true });
      await state.manager?.setMicrophone({ enable: payload.enable });
      await state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
      commit("setStudentAudio", payload);
      commit("setMicrophoneLock", { enable: false });
    } else {
      commit("setStudentAudio", payload);
    }
  },
  async setStudentVideo({ state, commit }, payload: { id: string; enable: boolean }) {
    if (payload.id === state.student?.id) {
      if (state.cameraLock) return;
      commit("setCameraLock", { enable: true });
      await state.manager?.setCamera({ enable: payload.enable });
      await state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
      commit("setStudentVideo", payload);
      commit("setCameraLock", { enable: false });
    } else {
      commit("setStudentVideo", payload);
    }
  },

  setStudentBadge(store, payload: { id: string; badge: number }) {
    store.commit("setStudentBadge", payload);
  },

  setTeacherAudio(store, payload: { id: string; enable: boolean }) {
    store.commit("setTeacherAudio", payload);
  },

  setTeacherVideo(store, payload: { id: string; enable: boolean }) {
    store.commit("setTeacherVideo", payload);
  },
  setClassView(store, payload: ClassViewPayload) {
    store.commit("setClassView", payload);
  },
  async studentRaisingHand(store, payload: any) {
    store.commit("setStudentRaisingHand", {
      raisingHand: true,
    });
    await store.state.manager?.WSClient.sendRequestRaisingHand();
  },
  async studentLike({ state }, _: any) {
    await state.manager?.WSClient.sendRequestLike();
  },
  async studentAnswer(
    { state },
    payload: {
      x: number;
      y: number;
      contentId: string;
    },
  ) {
    await state.manager?.WSClient.sendRequestAnswer(payload);
  },
  setStudentOneId({ commit }, p: { id: string }) {
    commit("setStudentOneId", p);
  },
  clearStudentOneId({ commit }, p: { id: string }) {
    commit("clearStudentOneId", p);
  },
  clearLaserPen({ commit }, p: "") {
    commit("clearLaserPen", p);
  },
  async studentAddShape({ state }, payload: Array<string>) {
    await state.manager?.WSClient.sendRequestStudentSetBrushstrokes(payload);
  },
  // async sendUnity({ state }, payload: {message : string}) {
  //   await state.manager?.WSClient.sendRequestUnity(payload.message);
  // }
  updateDisconnectStatus({ commit }, p: false) {
    commit("updateDisconnectStatus", p);
  },
  setOnline({ commit }) {
    commit("setOnline");
  },
  setOffline({ commit, state }) {
    commit("setOffline");
  },
  disconnectSignalR({ state }) {
    state.manager?.close();
  },
  async studentLeaveClass({ state }) {
    if (!state.info || !state.manager || !state.user) return;
    await state.manager?.WSClient.sendRequestStudentLeaveClass(state.info.id, state.user.id);
  },
  setIsJoined({ commit }, p: { isJoined: boolean }) {
    commit("setIsJoined", p);
  },
};

export default actions;
