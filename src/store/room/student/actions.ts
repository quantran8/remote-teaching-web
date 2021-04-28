import { RoomModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { GetClassesModel, RemoteTeachingService, StudentGetRoomResponse, TeacherGetRoomResponse, TeacherService } from "@/services";
import { Logger } from "@/utils/logger";
import { ActionTree } from "vuex";
import { ClassViewFromValue, ClassViewPayload, InClassStatus, WhiteboardPayload } from "../interface";
import { useStudentRoomHandler } from "./handler";
import { StudentRoomState } from "./state";
import { UID } from "agora-rtc-sdk-ng";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";
import { StudentShape } from "@/store/annotation/state";

const actions: ActionTree<StudentRoomState, any> = {
  async initClassRoom(
    { commit },
    payload: {
      classId: string;
      userId: string;
      userName: string;
      studentId: string;
      role: string;
    },
  ) {
    commit("setUser", {
      id: payload.studentId,
      name: payload.userName,
    });
    const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(payload.studentId);
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
    await store.state.manager?.WSClient.sendRequestJoinRoom(store.state.info.id, store.state.user.id);
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
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(state.user.id);
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
  },
  async loadClasses({ commit }, { teacherId }: { teacherId: string }) {
    const response: GetClassesModel = await TeacherService.getClasses(teacherId);
    if (!response) return;
    commit("setClasses", response.data);
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
  async studentAddShape({ state }, payload: { studentShapes: Array<StudentShape> }) {
    await state.manager?.WSClient.sendRequestStudentSetBrushstrokes(payload.studentShapes);
  },
  // async sendUnity({ state }, payload: {message : string}) {
  //   await state.manager?.WSClient.sendRequestUnity(payload.message);
  // }
};

export default actions;
