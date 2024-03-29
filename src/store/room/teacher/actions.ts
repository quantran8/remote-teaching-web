import { AgoraEventHandler } from "@/agora";
import { ErrorLocale } from "@/locales/localeid";
import { MediaStatus, RoomModel } from "@/models";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UpdateLessonAndUnitModel } from "@/models/update-lesson-and-unit.model";
import { UserModel } from "@/models/user.model";
import router from "@/router";
import { HelperService, InfoService, RemoteTeachingService, StudentService, TeacherGetRoomResponse } from "@/services";
import { BlobTagItem } from "@/services/storage/interface";
import { store } from "@/store";
import { Sticker } from "@/store/annotation/state";
import { UserRole } from "@/store/app/state";
import { MIN_SPEAKING_LEVEL, MIN_ZOOM_RATIO } from "@/utils/constant";
import { Logger } from "@/utils/logger";
import { Paths } from "@/utils/paths";
import { FabricObject } from "@/ws";
import { HubConnectionState } from "@microsoft/signalr";
import { UID } from "agora-rtc-sdk-ng";
import { notification } from "ant-design-vue";
import _ from "lodash";
import { fmtMsg } from "vue-glcommonui";
import { ActionTree } from "vuex";
import { StudentStorageService } from "../../../services/storage/service";
import {
	ClassViewPayload,
	DefaultPayload,
	DeviceMediaPayload,
	HelperInClassStatus,
	InClassStatus,
	InitClassRoomPayload,
	NetworkQualityPayload,
	StudentBadgePayload,
	StudentCaptureStatus,
	UserIdPayload,
	UserMediaPayload,
	ValueOfClassView,
	WhiteboardPayload
} from "../interface";
import { useTeacherRoomWSHandler } from "./handler";
import { TeacherRoomState } from "./state";

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
      const { markAsComplete } = payload;
      await state.manager?.WSClient.sendRequestEndRoom(state.info?.id);
      await RemoteTeachingService.teacherEndClassRoom(state.info?.id, markAsComplete);
    }
    commit("endClass", payload);
  },
  async helperExitClass({ commit, state }) {
    if (state.info) {
      try {
        await HelperService.exitSession();
      } catch (error) {
        Logger.error(error);
      }
    }
    commit("endClass");
  },
  setClassView({ state }, payload: ClassViewPayload) {
    const teachingMode = ValueOfClassView(payload.classView);
    state.manager?.WSClient.sendRequestSetTeachingMode(teachingMode);
  },
  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  setError(store, payload: GLError | null) {
    store.commit("setError", payload);
  },
  async updateAudioAndVideoFeed({ state, rootGetters }) {
    const { globalAudios, localAudios, manager, students, idOne, teacher, helper } = state;
    const userId: string | undefined = rootGetters["auth/userId"];
    if (!manager) return;
    const cameras = students.filter((s) => s.videoEnabled && s.status === InClassStatus.JOINED).map((s) => s.id);
    let audios = students.filter((s) => s.audioEnabled && s.status === InClassStatus.JOINED).map((s) => s.id);
    if (localAudios.length > 0) {
      audios = [...localAudios];
    } else if (globalAudios.length > 0) {
      audios = [...globalAudios];
    }

    // if currentUser is teacher => subscribe helper video/audio
    if (helper && userId !== helper.id) {
      // condition to subscribe helper's video
      if (!helper.isMuteVideo && helper.connectionStatus !== HelperInClassStatus.Disconnected && helper.isVideoShownByTeacher) {
        cameras.push(helper.id);
      }
      if (!helper.isMuteAudio) {
        audios.push(helper.id);
      }
    }
    // and vice versa
    if (teacher && userId !== teacher?.id) {
      if (teacher.videoEnabled) {
        cameras.push(teacher.id);
      }
      if (teacher.audioEnabled) {
        audios.push(teacher.id);
      }
    }

    if (idOne) {
      const otherStudentsCamId = cameras.filter((camId) => camId !== idOne && camId !== teacher?.id);
      const otherStudentsAudioId = audios.filter((audioId) => audioId !== idOne && audioId !== teacher?.id);
      for (const id of otherStudentsCamId) {
        const index = cameras.findIndex((camId) => camId === id);
        if (index > -1) {
          cameras.splice(index, 1);
        }
      }
      for (const id of otherStudentsAudioId) {
        const index = audios.findIndex((audioId) => audioId === id);
        if (index > -1) {
          audios.splice(index, 1);
        }
      }
    }
    return manager?.updateAudioAndVideoFeed(cameras, audios);
  },
  async leaveRoom({ state, dispatch, rootGetters }, _payload: { leave: boolean }) {
    const checkMessageTimer = rootGetters["checkMessageVersionTimer"];
    if (checkMessageTimer) {
      clearInterval(checkMessageTimer);
    }
    dispatch("setCheckMessageVersionTimer", -1, { root: true });
    return state.manager?.close(_payload.leave);
  },
  async joinWSRoom(store, _payload: any) {
    if (!store.state.info || !store.state.manager) return;
    const { teacher } = store.state;
    const userId: string | undefined = store.rootGetters["auth/userId"];
    const isHelper = teacher && userId !== teacher?.id;
    const isMuteAudio = store.rootGetters["isMuteAudio"];
    const isHideVideo = store.rootGetters["isHideVideo"];
    store.state.manager?.WSClient.sendRequestJoinRoom(store.state.info.id, _payload.browserFingerPrinting, isMuteAudio, isHideVideo, isHelper);
    const eventHandler = useTeacherRoomWSHandler(store);
    store.state.manager?.registerEventHandler(eventHandler);
    store.dispatch("setMuteAudio", { status: MediaStatus.noStatus }, { root: true });
    store.dispatch("setHideVideo", { status: MediaStatus.noStatus }, { root: true });

    let checkMessageTimer = store.rootGetters["checkMessageVersionTimer"];
    if (checkMessageTimer) {
      clearInterval(checkMessageTimer);
    }
    checkMessageTimer = setInterval(async () => {
      try {
        if (store.state.manager?.WSClient.hubConnection.state == HubConnectionState.Connected)
          await store.state.manager?.WSClient.sendCheckTeacherMessageVersion();
      } catch (err) {
        //error here loss signalR network, for loss API connection
        //disconnect now because window.offline event not work correctly sometimes
        //if(store.getters["isDisconnected"] == false) {
        //	console.log("PING FAILED- SHOULD DISCONNECT TEACHER");
        //dispatch("setOffline");
        //}
      }
    }, 3000);
    store.dispatch("setCheckMessageVersionTimer", checkMessageTimer, { root: true });
  },
  async joinRoom(store, _payload: any) {
    const { state, dispatch, rootState } = store;
    if (!state.info || !state.teacher || !state.manager) return;
    const userId: string | undefined = store.rootGetters["auth/userId"];
    const isHelper = state.teacher && userId !== state.teacher?.id;
    let cameraStatus = state.teacher?.videoEnabled;
    let microphoneStatus = state.teacher?.audioEnabled;
    const isMuteAudio = store.rootGetters["isMuteAudio"];
    if (isMuteAudio !== MediaStatus.noStatus) {
      if (isMuteAudio === MediaStatus.mediaNotLocked) {
        microphoneStatus = true;
      }
      if (isMuteAudio === MediaStatus.mediaLocked) {
        microphoneStatus = false;
      }
    }
    const isHideVideo = store.rootGetters["isHideVideo"];
    if (isHideVideo !== MediaStatus.noStatus) {
      if (isHideVideo === MediaStatus.mediaNotLocked) {
        cameraStatus = true;
      }
      if (isHideVideo === MediaStatus.mediaLocked) {
        cameraStatus = false;
      }
    }

    // always open helper's cam/micro (will remove in next story)
    if (isHelper) {
      cameraStatus = true;
      microphoneStatus = true;
    }

    await state.manager?.join({
      camera: cameraStatus,
      microphone: microphoneStatus,
      classId: state.info.id,
      teacherId: state.user?.id,
      idOne: state.idOne,
      reJoin: _payload ? _payload.reJoin : false,
      isMirror: state.info.isTeacherVideoMirror,
      isRemoteMirror: state.info.isStudentVideoMirror,
    });
    if (_payload && _payload.reJoin) return;
    let currentBandwidth = 0;
    const intervalLogBandwidth = (window as any)["intervalLogBandwidth"];
    if (intervalLogBandwidth) {
      clearInterval(intervalLogBandwidth);
    }
    const interval = setInterval(() => {
      state.manager?.getBandwidth()?.then((speedMbps) => {
        if (speedMbps > 0) {
          currentBandwidth = speedMbps;
        }
        if (currentBandwidth) {
          //mean 5 minutes
          Logger.info("LOG BANDWIDTH", currentBandwidth.toFixed(2));
          RemoteTeachingService.putTeacherBandwidth(currentBandwidth.toFixed(2));
          currentBandwidth = 0;
        }
      });
    }, 300000); // 300000 = 5 minutes

    (window as any)["intervalLogBandwidth"] = interval;

    //if (store.rootGetters["platform"] === VCPlatform.Agora) {
    const agoraEventHandler: AgoraEventHandler = {
      onUserPublished: (user, mediaType) => {
        Logger.log("user-published", user.uid, mediaType);
        dispatch("updateAudioAndVideoFeed", {});
      },
      onUserUnPublished: (user, mediaType) => {
        Logger.log("user-unpublished", user.uid, mediaType);
        dispatch("updateAudioAndVideoFeed", {});
      },
      onException: (payload: any) => {
        Logger.log("agora-exception-event", payload);
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
            const studentIdExisting = listStudentLowBandWidthState.find((id) => studentId === id);
            if (!studentIdExisting) {
              hasChange = true;
              listStudentLowBandWidthState.push(studentId);
            }
          }
          if (uplinkNetworkQuality < lowBandWidthPoint && downlinkNetworkQuality < lowBandWidthPoint) {
            const studentIdExistingIndex = listStudentLowBandWidthState.findIndex((id) => studentId === id);
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
    state.manager?.registerVideoCallSDKEventHandler(agoraEventHandler);
    //}
  },
  async initClassRoom({ commit, dispatch, rootState }, payload: InitClassRoomPayload) {
    commit("setUser", { id: payload.userId, name: payload.userName });
    try {
      let roomResponse: TeacherGetRoomResponse | null = null;
      if (payload.isHelper && payload.groupId) {
        roomResponse = await HelperService.getSessionAsHelper(payload.groupId, payload.browserFingerPrinting);
      } else {
        roomResponse = await RemoteTeachingService.getActiveClassRoom(payload.browserFingerPrinting);
      }
      const roomInfo: RoomModel = roomResponse.data;

      if (!roomInfo || roomInfo.classInfo.classId !== payload.classId) {
        commit("setError", {
          errorCode: GLErrorCode.CLASS_IS_NOT_ACTIVE,
          message: fmtMsg(ErrorLocale.ClassNotStarted),
        });
        return;
      }
      commit("setRoomInfo", roomResponse.data);
      await store.dispatch("setVideoCallPlatform", roomInfo.videoPlatformProvider);
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("annotation/setInfo", roomInfo.annotation, {
        root: true,
      });
      await dispatch("lesson/setInfo", { lessonPlan: roomInfo.lessonPlan, isSetCurrentExposure: !roomInfo.studentOneToOne }, { root: true });
      await dispatch("interactive/setInfo", roomInfo.lessonPlan.interactive, {
        root: true,
      });
      await dispatch(
        "lesson/setTargetsVisibleAllAction",
        {
          userId: roomResponse.data.teacher.id,
          visible: roomResponse.data.annotation?.drawing?.isShowingAllShapes ?? false,
        },
        { root: true },
      );
      await dispatch("lesson/setTargetsVisibleListJoinedAction", roomResponse.data.annotation?.drawing?.visibleShapes, { root: true });

      if (roomInfo.oneAndOneDto) {
        store.commit("lesson/setCurrentExposure", {
          id: roomInfo.oneAndOneDto.exposureSelected,
          skipToSetCurrentExposureItemMedia: roomInfo.oneAndOneDto.itemContentSelected ? true : false,
        });
        store.commit("lesson/setCurrentExposureItemMedia", {
          id: roomInfo.oneAndOneDto?.itemContentSelected,
        });
        commit("teacherRoom/setWhiteboard", roomInfo.oneAndOneDto.isShowWhiteBoard, { root: true });
      } else {
        commit("teacherRoom/setWhiteboard", roomInfo.isShowWhiteBoard, { root: true });
      }

      if (roomInfo.studentOneToOne) {
        await dispatch(
          "teacherRoom/setStudentOneId",
          { id: roomInfo.studentOneToOne },
          {
            root: true,
          },
        );
        await dispatch("lesson/setZoomRatio", roomInfo.oneAndOneDto.ratio ? roomInfo.oneAndOneDto.ratio : MIN_ZOOM_RATIO, { root: true });
        if (roomInfo.oneAndOneDto.position) {
          await dispatch("lesson/setImgCoords", { x: roomInfo.oneAndOneDto.position.x, y: roomInfo.oneAndOneDto.position.y }, { root: true });
        }
      } else {
        await dispatch("lesson/setZoomRatio", roomInfo.lessonPlan.ratio ? roomInfo.lessonPlan.ratio : MIN_ZOOM_RATIO, { root: true });
        if (roomInfo.lessonPlan.position) {
          await dispatch("lesson/setImgCoords", { x: roomInfo.lessonPlan.position.x, y: roomInfo.lessonPlan.position.y }, { root: true });
        }
        await dispatch("teacherRoom/clearStudentOneId", { id: "" }, { root: true });
      }
    } catch (err) {
      if (!rootState.teacherRoom.isDisconnected) {
        await router.push(Paths.Home);
      }
    }
  },
  async setAvatarAllStudent({ commit }, payload: { studentIds: string[] }) {
    const response = await StudentService.getAllAvatarStudent(payload.studentIds);
    if (response) commit("setAvatarAllStudent", response);
  },
  setSpeakingUsers({ commit }, payload: { level: number; uid: UID }[]) {
    const validSpeakings: Array<string> = [];
    if (payload) {
      payload.map((item) => {
        if (item.level >= MIN_SPEAKING_LEVEL) {
          // should check by a level
          validSpeakings.push(item.uid?.toString());
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
  async toggleAnnotation({ state, commit }, payload: { studentId: string; isEnable: boolean }) {
    commit("setStudentPalette", payload);
    state.manager?.WSClient.sendRequestToggleAnnotation(payload.studentId, payload.isEnable);
  },
  setStudentBadge({ state }, payload: StudentBadgePayload) {
    state.manager?.WSClient.sendRequestSetStudentBadge([payload.id], payload.badge);
  },
  async setAllStudentBadge({ state }) {
    state.manager?.WSClient.sendRequestSetStudentBadge([], 1);
  },
  async setTeacherAudio({ state, commit }, payload: DeviceMediaPayload) {
    if (state.microphoneLock) return;
    commit("setMicrophoneLock", { enable: true });
    try {
      await state.manager?.setMicrophone({ enable: payload.enable });
      await state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
      commit("setTeacherAudio", payload);
      commit("setMicrophoneLock", { enable: false });
    } catch (error) {
      commit("setMicrophoneLock", { enable: false });
    }
  },

  async setTeacherVideo({ state, commit }, payload: DeviceMediaPayload) {
    if (state.cameraLock) return;
    commit("setCameraLock", { enable: true });
    try {
      await state.manager?.setCamera({ enable: payload.enable, videoEncoderConfigurationPreset: "480p" });
      await state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
      commit("setTeacherVideo", payload);
      commit("setCameraLock", { enable: false });
    } catch (error) {
      commit("setCameraLock", { enable: false });
    }
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
  disableAllStudents({ commit, state }) {
    commit("disableAllStudents", {});
    state.manager?.WSClient.sendRequestDisableAllAnnotation(true);
  },
  disableAllStudentsPalette({ commit, state }) {
    commit("disableAllStudentsPalette", {});
    state.manager?.WSClient.sendRequestResetPaletteAllStudent(true);
  },

  enableAllStudents({ state, commit }) {
    commit("enableAllStudents", {});
    state.manager?.WSClient.sendRequestDisableAllAnnotation(false);
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
    const student = state.students.find((e) => e.id === payload.id && e.raisingHand);
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
    if (!state.info) return;
    try {
      await RemoteTeachingService.teacherDrawLine(JSON.stringify(payload.drawing), state.info.id);
    } catch (e) {
      Logger.log(e);
    }
  },
  async setClearBrush({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestClearAllBrush(payload);
  },
  async setResetZoom({ state }, payload: any) {
    await state.manager?.WSClient.sendRequestResetZoom(payload);
  },
  async setZoomSlide({ state }, payload: number) {
    await state.manager?.WSClient.sendRequestZoomSlide(payload);
  },
  async setMoveZoomedSlide({ state }, payload: { x: number; y: number; viewPortX: number; viewPortY: number }) {
    await state.manager?.WSClient.sendRequestMoveZoomedSlide(payload);
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
  setMediaState({ state }, payload: any) {
    state.manager?.WSClient.sendRequestSetMediaState(payload);
  },
  setCurrentTimeMedia({ state }, payload: any) {
    state.manager?.WSClient.sendRequestSetCurrentTimeMedia(payload);
  },
  setLaserPath({ state }, payload: string) {
    state.manager?.WSClient.sendRequestDrawLaser(payload);
  },
  setOnline({ commit }) {
    commit("setOnline");
  },
  setOffline({ commit, rootState }) {
    if (rootState.app.userRole === UserRole.Teacher) {
      commit("setOffline");
    }
  },
  setTeacherLowBandWidth({ commit }, p: boolean) {
    commit("setTeacherLowBandWidth", p);
  },
  setListStudentLowBandWidth({ commit }, p: string[]) {
    commit("setListStudentLowBandWidth", p);
  },
  async setShapesForStudent({ state }, payload: Array<string>) {
    if (!state.info) return;
    try {
      await RemoteTeachingService.teacherAddShape(payload, state.info.id);
    } catch (e) {
      Logger.log(e);
    }
  },
  async getAvatarTeacher({ commit }, payload: { teacherId: string }) {
    const response = await InfoService.getAvatarTeacher(payload.teacherId);
    if (response) commit("setAvatarTeacher", response);
  },
  teacherCreateFabricObject({ state }, payload: any) {
    const { objectId } = payload;
    const fabricObject: FabricObject = {
      fabricId: objectId,
      fabricData: JSON.stringify(payload.toJSON()),
    };
    state.manager?.WSClient.sendRequestCreateFabricObject(fabricObject);
  },
  teacherModifyFabricObject({ state }, payload: any) {
    const { objectId } = payload;
    const fabricObject: FabricObject = {
      fabricId: objectId,
      fabricData: JSON.stringify(payload.toJSON()),
    };
    state.manager?.WSClient.sendRequestModifyFabricObject(fabricObject);
  },
  setTargetsVisibleAllAction({ state }, payload: any) {
    state.manager?.WSClient.sendRequestToggleAllShapes(payload);
  },
  setTargetsVisibleListAction({ state }, payload: any) {
    state.manager?.WSClient.sendRequestToggleShape(payload);
  },
  async generateOneToOneToken({ state }, payload: { classId: string; userId: string }) {
    try {
      const zoom = state.manager?.zoomClient;
      if (zoom) {
        await zoom.teacherJoinOneToOneSubSession(payload.userId);
        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: true,
          id: payload.userId,
        });
      }
    } catch (error) {
      Logger.log(error);
    }
  },
  async setLessonAndUnit({ commit, state, dispatch, rootState }, p: { unit: number; lesson: number; unitId: number; isCompleted: boolean }) {
    if (!state.info?.id) {
      return;
    }

    const data: UpdateLessonAndUnitModel = {
      unit: p.unit,
      lesson: p.lesson,
      unitId: p.unitId,
      sessionId: state.info?.id as string,
      isCompleted: p.isCompleted,
    };

    const roomInfo = await RemoteTeachingService.teacherUpdateLessonAndUnit(data);
    if (p.isCompleted) {
      const contents = state.info?.lessonPlan?.contents;
      for (const content of contents ?? []) {
        await dispatch("endExposure", { id: content.id });
      }
    }
    commit({ type: "lesson/clearLessonData" }, { root: true });
    await commit("setRoomInfo", roomInfo);
	await dispatch("lesson/setInfo", { lessonPlan: roomInfo.lessonPlan, isSetCurrentExposure: !roomInfo.studentOneToOne }, { root: true });
    await dispatch("lesson/setZoomRatio", MIN_ZOOM_RATIO, { root: true });
    await dispatch("lesson/setImgCoords", undefined, { root: true });

    await state.manager?.WSClient.sendRequestUpdateSessionAndUnit({});
  },
  async sendRequestCaptureImage({ state }, payload: { isCaptureAll: boolean; studentId: string }) {
    await state.manager?.WSClient.sendRequestCaptureImage(payload);
  },
  async getStudentCapturedImages(
    { getters, commit },
    p: { token: string; schoolId: string; classId: string; groupId: string; studentId: string; date: string; filterMode: number },
  ) {
    try {
      const result = await StudentStorageService.getFiles(p.token, p.schoolId, p.classId, p.groupId, p.studentId, p.date, p.filterMode);
      if (result.length) {
        const data = result.sort((a, b) => (a.tags.dateTime > b.tags.dateTime ? -1 : 1));
        commit("setStudentsImageCaptured", data);
      }
    } catch (error) {
      console.log(error);
    }
  },
  async removeStudentImage({ getters }, p: { token: string; fileName: string }) {
    try {
      await StudentStorageService.removeFile(p.token, p.fileName);
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.error,
        duration: 3,
      });
    }
  },
  async setRoomInfo({ commit }, p: TeacherGetRoomResponse) {
    commit("setRoomInfo", p);
  },
  setStudentsImageCaptured({ commit }, p: Array<BlobTagItem>) {
    commit("setStudentsImageCaptured", p);
  },
  setStudentsCaptureDone({ commit }, p: StudentCaptureStatus) {
    commit("setStudentsCaptureDone", p);
  },
  setCaptureAll({ commit }, p: boolean) {
    commit("setCaptureAll", p);
  },
  clearStudentsCaptureDone({ commit }) {
    commit("clearStudentsCaptureDone");
  },
  async setPencilPath({ state }, p: any) {
    await state.manager?.WSClient.sendRequestDrawPencil(p);
  },
  async setDeleteShape({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestDeleteShape(payload);
  },
  async setDeleteFabric({ state }, payload: {}) {
    await state.manager?.WSClient.sendRequestDeleteFabric(payload);
  },
};

export default actions;
