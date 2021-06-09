import { AgoraEventHandler } from "@/agora";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { LessonService, RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { ActionTree } from "vuex";
import {
  ClassViewPayload,
  DefaultPayload,
  DeviceMediaPayload,
  InClassStatus,
  InitClassRoomPayload,
  StudentBadgePayload,
  StudentState,
  UserIdPayload,
  UserMediaPayload,
  ValueOfClassView,
  WhiteboardPayload,
  NetworkQualityPayload,
} from "../interface";
import { TeacherRoomState } from "./state";
import { useTeacherRoomWSHandler } from "./handler";
import { RoomModel } from "@/models";
import { Logger } from "@/utils/logger";
import { Sticker } from "@/store/annotation/state";
import { UID } from "agora-rtc-sdk-ng";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";
import { Paths } from "@/utils/paths";
import router from "@/router";
import { fmtMsg } from "commonui";
import { ErrorLocale } from "@/locales/localeid";
import _ from "lodash";

const networkQualityStats = {
  "0": 0, //The network quality is unknown.
  "1": 1, //The network quality is excellent.
  "2": 2, //The network quality is quite good, but the bitrate may be slightly lower than excellent.
  "3": 3, //Users can feel the communication slightly impaired.
  "4": 4, //Users can communicate only not very smoothly.
  "5": 5, //The network is so bad that users can hardly communicate.
  "6": 6, //The network is down and users cannot communicate at all.
};

const lowBandWidthPoint = networkQualityStats["3"];

const actions: ActionTree<TeacherRoomState, any> = {
  async endClass({ commit, state }, payload: DefaultPayload) {
    if (state.info) {
      await state.manager?.WSClient.sendRequestEndRoom(state.info?.id);
      await RemoteTeachingService.teacherEndClassRoom(state.info?.id);
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
    const { globalAudios, localAudios, manager, students, idOne, teacher } = state;
    if (!manager) return;
    const cameras = students.filter(s => s.videoEnabled && s.status === InClassStatus.JOINED).map(s => s.id);
    let audios = students.filter(s => s.audioEnabled && s.status === InClassStatus.JOINED).map(s => s.id);
    if (localAudios.length > 0) {
      audios = [...localAudios];
    } else if (globalAudios.length > 0) {
      audios = [...globalAudios];
    }
    if (idOne) {
      return manager?.oneToOneSubscribeAudio(cameras, audios, idOne, teacher);
    }
    return manager?.updateAudioAndVideoFeed(cameras, audios);
  },
  async leaveRoom({ state }, _payload: any) {
    return state.manager?.close();
  },
  async joinWSRoom(store, _payload: any) {
    if (!store.state.info || !store.state.manager) return;
    store.state.manager?.WSClient.sendRequestJoinRoom(store.state.info.id, _payload.browserFingerPrinting);
    const eventHandler = useTeacherRoomWSHandler(store);
    store.state.manager?.registerEventHandler(eventHandler);
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
    const agoraEventHandler: AgoraEventHandler = {
      onUserPublished: (_user, _mediaType) => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onUserUnPublished: _payload => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onException: (payload: any) => {
        // Logger.error("Exception", payload);
      },
      onVolumeIndicator(result: { level: number; uid: UID }[]) {
        // console.log("speaking", JSON.stringify(result));
        dispatch("setSpeakingUsers", result);
      },
      onLocalNetworkUpdate(payload: NetworkQualityPayload) {
        const { uplinkNetworkQuality, downlinkNetworkQuality } = payload;
        if ((uplinkNetworkQuality >= lowBandWidthPoint || downlinkNetworkQuality >= lowBandWidthPoint) && !state.isLowBandWidth) {
          dispatch("setTeacherLowBandWidth", true);
        }
        if (uplinkNetworkQuality < lowBandWidthPoint && downlinkNetworkQuality < lowBandWidthPoint && state.isLowBandWidth) {
          dispatch("setTeacherLowBandWidth", false);
        }
        const studentIdNetworkQuality = state.manager?.agoraClient?._client?.getRemoteNetworkQuality();
        let hasChange = false;
        const listStudentLowBandWidthState = [...state.listStudentLowBandWidth];
        if (_.isEmpty(studentIdNetworkQuality)) return;
        for (const studentId in studentIdNetworkQuality) {
          const networkQuality: NetworkQualityPayload = studentIdNetworkQuality[studentId];
          const { uplinkNetworkQuality, downlinkNetworkQuality } = networkQuality;
          if (uplinkNetworkQuality >= lowBandWidthPoint || downlinkNetworkQuality >= lowBandWidthPoint) {
            const studentIdExisting = listStudentLowBandWidthState.find(id => studentId === id);
            if (!studentIdExisting) {
              hasChange = true;
              listStudentLowBandWidthState.push(studentId);
            }
          }
          if (uplinkNetworkQuality < lowBandWidthPoint && downlinkNetworkQuality < lowBandWidthPoint) {
            const studentIdExistingIndex = listStudentLowBandWidthState.findIndex(id => studentId === id);
            if (studentIdExistingIndex > -1) {
              hasChange = true;
              listStudentLowBandWidthState.splice(studentIdExistingIndex, 1);
            }
          }
        }
        if (hasChange) {
          dispatch("setListStudentLowBandWidth", listStudentLowBandWidthState);
        }
      },
    };
    state.manager?.registerAgoraEventHandler(agoraEventHandler);
  },
  async initClassRoom({ commit, dispatch }, payload: InitClassRoomPayload) {
    commit("setUser", { id: payload.userId, name: payload.userName });
    try {
      const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom(payload.browserFingerPrinting);
      const roomInfo: RoomModel = roomResponse.data;
      if (!roomInfo || roomInfo.classId !== payload.classId) {
        commit("setError", {
          errorCode: GLErrorCode.CLASS_IS_NOT_ACTIVE,
          message: fmtMsg(ErrorLocale.ClassNotStarted),
        });
        return;
      }
      commit("setRoomInfo", roomResponse.data);
    } catch (err) {
      await router.push(Paths.Home);
    }
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
  async setStudentAudio({ state, commit }, payload: UserMediaPayload) {
    await state.manager?.WSClient.sendRequestMuteStudentAudio(payload.id, !payload.enable);
    commit("setStudentAudio", payload);
  },
  async setStudentVideo({ state, commit }, payload: UserMediaPayload) {
    commit("setStudentVideo", payload);
    state.manager?.WSClient.sendRequestMuteStudentVideo(payload.id, !payload.enable);
  },
  setStudentBadge({ state }, payload: StudentBadgePayload) {
    state.manager?.WSClient.sendRequestSetStudentBadge([payload.id], payload.badge);
  },
  async setAllStudentBadge({ state }) {
    state.manager?.WSClient.sendRequestSetStudentBadge([], 1);
  },
  async disableAllAnnotation({ state }) {
    state.manager?.WSClient.sendRequestDisableAllAnnotation();
  },
  async toggleAnnotation({ state }, payload: { studentId: string; isEnable: boolean }) {
    state.manager?.WSClient.sendRequestToggleAnnotation(payload.studentId, payload.isEnable);
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
    await state.manager?.setCamera({ enable: payload.enable, videoEncoderConfigurationPreset: "480p" });
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
    state.manager?.WSClient.sendRequestBlackOutLessonContent(payload.isBlackOut);
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
    const student = state.students.find(e => e.id === payload.id && e.raisingHand);
    if (student) state.manager?.WSClient.sendRequestClearRaisingHand(payload.id);
  },
  setClassAction({ state }, payload: { action: number }) {
    state.manager?.WSClient.sendRequestSetClassAction(payload.action);
  },
  async teacherAnswer(
    { state },
    payload: {
      x: number;
      y: number;
      contentId: string;
    },
  ) {
    await state.manager?.WSClient.sendRequestAnswer(payload);
  },
  async setPointer({ state }, payload: { x: number; y: number }) {
    await state.manager?.WSClient.sendRequestSetPointer(payload);
  },
  async setMode({ state }, payload: { mode: number }) {
    await state.manager?.WSClient.sendRequestUpdateAnnotationMode(payload.mode);
  },
  async setBrush({ state }, payload: { drawing: string }) {
    await state.manager?.WSClient.sendRequestAddBrush(payload.drawing);
  },
  async setClearBrush({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestClearAllBrush(payload);
  },
  async setDeleteBrush({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestDeleteBrush(payload);
  },
  async setStickers({ state }, payload: { stickers: Array<Sticker> }) {
    await state.manager?.WSClient.sendRequestSetStickers(payload.stickers);
  },
  async setClearStickers({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestClearStickers(payload);
  },
  // async sendUnity({ state }, payload: {message: string}) {
  //   await state.manager?.WSClient.sendRequestUnity(payload.message);
  // },
  async sendOneAndOne({ state }, payload: { status: boolean; id: string }) {
    await state.manager?.WSClient.sendRequestSetOneToOne(payload);
  },
  setStudentOneId({ commit }, p: { id: string }) {
    commit("setStudentOneId", p);
  },
  clearStudentOneId({ commit }, p: { id: string }) {
    commit("clearStudentOneId", p);
  },
  setWhiteboard({ state }, payload: WhiteboardPayload) {
    state.manager?.WSClient.sendRequestSetWhiteboard(payload.isShowWhiteBoard);
  },
  setLaserPath({ state }, payload: string) {
    state.manager?.WSClient.sendRequestDrawLaser(payload);
  },
  setOnline({ commit }) {
    commit("setOnline");
  },
  setOffline({ commit }) {
    commit("setOffline");
  },
  setTeacherLowBandWidth({ commit }, p: boolean) {
    commit("setTeacherLowBandWidth", p);
  },
  setListStudentLowBandWidth({ commit }, p: string[]) {
    commit("setListStudentLowBandWidth", p);
  },
};

export default actions;
