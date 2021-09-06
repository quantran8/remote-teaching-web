import { RoomModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { RemoteTeachingService, StudentGetRoomResponse, TeacherGetRoomResponse, StudentService, InfoService } from "@/services";
import { ActionTree } from "vuex";
import { ClassViewFromValue, ClassViewPayload, InClassStatus } from "../interface";
import { useStudentRoomHandler } from "./handler";
import { StudentRoomState } from "./state";
import { UID } from "agora-rtc-sdk-ng";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";
import { ErrorCode, fmtMsg } from "commonui";
import router from "@/router";
import { Paths } from "@/utils/paths";
import { ErrorLocale } from "@/locales/localeid";
import { MediaStatus } from "@/models";
import { Logger } from "@/utils/logger";
import { isMobileBrowser } from "@/utils/utils";

const actions: ActionTree<StudentRoomState, any> = {
  async initClassRoom(
    { commit, dispatch, state },
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
      const roomInfo: RoomModel = roomResponse.data;
      if (!roomInfo || roomInfo.classInfo.classId !== payload.classId) {
        commit("setApiStatus", {
          code: GLErrorCode.CLASS_IS_NOT_ACTIVE,
          message: fmtMsg(ErrorLocale.ClassNotStarted),
        });
        return;
      } else {
        commit("setApiStatus", {
          code: GLErrorCode.SUCCESS,
          message: "",
        });
      }
      commit("setRoomInfo", roomResponse.data);
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("lesson/setInfo", roomResponse.data.lessonPlan, { root: true });
      await dispatch("interactive/setInfo", roomResponse.data.lessonPlan.interactive, {
        root: true,
      });
      await dispatch("interactive/setCurrentUserId", state.user?.id, {
        root: true,
      });
      await dispatch("annotation/setInfo", roomResponse.data.annotation, {
        root: true,
      });
      if (roomResponse.data.studentOneToOne) {
        await dispatch("studentRoom/setStudentOneId", { id: roomResponse.data.studentOneToOne }, { root: true });
        await dispatch("setClassView", { classView: ClassViewFromValue(roomResponse.data.oneAndOneDto.teachingMode) });
        await commit("lesson/setCurrentExposure", { id: roomResponse.data.oneAndOneDto.exposureSelected }, { root: true });
        await commit("lesson/setCurrentExposureItemMedia", { id: roomResponse.data.oneAndOneDto.itemContentSelected }, { root: true });
        await commit("updateIsPalette", {
          id: roomResponse.data.oneAndOneDto.id,
          isPalette: roomResponse.data.oneAndOneDto.isEnablePalette,
        });
        await commit("setWhiteboard", roomResponse.data.oneAndOneDto.isShowWhiteBoard);
        await dispatch("annotation/setOneTeacherStrokes", roomResponse.data.annotation.oneOneDrawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: roomResponse.data.annotation.oneOneDrawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: roomResponse.data.annotation.oneOneDrawing.shapes }, { root: true });
        await dispatch("annotation/setOneStudentStrokes", roomResponse.data.annotation.oneOneDrawing.studentBrushstrokes, { root: true });
      } else {
        await dispatch("studentRoom/clearStudentOneId", { id: "" }, { root: true });
      }
      if (roomResponse.data.teacher.disconnectTime) {
        commit("setTeacherDisconnected", true);
      }
      commit("setClassView", {
        classView: ClassViewFromValue(roomResponse.data.teachingMode),
      });
      commit("setWhiteboard", roomResponse.data.isShowWhiteBoard);
    } catch (error) {
      if (error.code == null) {
        commit("setApiStatus", {
          code: GLErrorCode.DISCONNECT,
          message: "",
        });
        return Logger.log(error);
      }
      if (error.code === ErrorCode.ConcurrentUserException) {
        await router.push(Paths.Home);
      } else if (error.code === ErrorCode.StudentNotInClass) {
        commit("setApiStatus", {
          code: GLErrorCode.PARENT_NOT_HAVE_THIS_STUDENT,
          message: fmtMsg(ErrorLocale.ParentAccountNotHaveThisStudent),
        });
      } else {
        commit("setApiStatus", {
          code: GLErrorCode.CLASS_IS_NOT_ACTIVE,
          message: fmtMsg(ErrorLocale.ClassNotStarted),
        });
        return;
      }
    }
  },
  async setAvatarAllStudent({ commit }, payload: { studentIds: string[] }) {
    const response = await StudentService.getAllAvatarStudent(payload.studentIds);
    if (response) commit("setAvatarAllStudent", response);
  },
  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  async updateAudioAndVideoFeed({ state }) {
    const { globalAudios, manager, students, teacher, idOne, student, videosFeedVisible } = state;
    if (!manager) return;
    const cameras = students
      .filter(s => {
        if (!videosFeedVisible || isMobileBrowser) return false;
        return s.videoEnabled && s.status === InClassStatus.JOINED;
      })
      .map(s => s.id);
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
      //handle one to one student
      if (idOne === student?.id) {
        const cameraOtherStudentId = cameras.filter(camId => camId !== idOne && camId !== teacher?.id);
        const audioOtherStudentId = audios.filter(audioId => audioId !== idOne && audioId !== teacher?.id);
        for (const id of cameraOtherStudentId) {
          const cameraIndex = cameras.findIndex(camId => camId === id);
          cameras.splice(cameraIndex, 1);
        }
        for (const id of audioOtherStudentId) {
          const audioIndex = audios.findIndex(audioId => audioId === id);
          audios.splice(audioIndex, 1);
        }
      }

      //handle other students
      if (idOne !== student?.id) {
        //remove student one to one
        const studentCameraIndex = cameras.findIndex(camId => camId === idOne);
        if (studentCameraIndex > -1) {
          cameras.splice(studentCameraIndex, 1);
        }
        const studentAudioIndex = audios.findIndex(audioId => audioId === idOne);
        if (studentAudioIndex > -1) {
          audios.splice(studentAudioIndex, 1);
        }
        //remove teacher one to one
        const teacherCameraIndex = cameras.findIndex(camId => camId === teacher?.id);
        if (teacherCameraIndex > -1) {
          cameras.splice(teacherCameraIndex, 1);
        }
        const teacherAudioIndex = audios.findIndex(audioId => audioId === teacher?.id);
        if (teacherAudioIndex > -1) {
          audios.splice(teacherAudioIndex, 1);
        }
      }
    }
    return manager?.updateAudioAndVideoFeed(cameras, audios);
  },
  async joinWSRoom(store, _payload: any) {
    if (!store.state.info || !store.state.manager || !store.state.user) return;
    const isMuteAudio = store.rootGetters["isMuteAudio"];
    const isHideVideo = store.rootGetters["isHideVideo"];
    await store.state.manager?.WSClient.sendRequestJoinRoom(
      store.state.info.id,
      store.state.user.id,
      _payload.browserFingerPrinting,
      isMuteAudio,
      isHideVideo,
    );
    const eventHandler = useStudentRoomHandler(store);
    store.state.manager?.registerEventHandler(eventHandler);
    store.dispatch("setMuteAudio", { status: MediaStatus.noStatus }, { root: true });
    store.dispatch("setHideVideo", { status: MediaStatus.noStatus }, { root: true });
  },
  async joinRoom(store, _payload: any) {
    const { state, dispatch, rootState } = store;
    if (!state.info || !state.user) return;
    if (!state.manager?.isJoinedRoom()) {
      let cameraStatus = state.student?.videoEnabled;
      let microphoneStatus = state.student?.audioEnabled;
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
      await state.manager?.join({
        camera: cameraStatus,
        microphone: microphoneStatus,
        classId: state.info?.id,
        studentId: state.user?.id,
      });
    }
    let currentBandwidth = 0;
    let time = 0;
    setInterval(() => {
      state.manager?.getBandwidth().then(speedMbps => {
        if (speedMbps > 0) {
          currentBandwidth = speedMbps;
        }
        time += 1;
        if (currentBandwidth && time % 10 === 0 && state.user && state.user.id) {
          //mean 5 minutes
          Logger.info("LOG BANDWIDTH", currentBandwidth.toFixed(2));
          RemoteTeachingService.putStudentBandwidth(state.user.id, currentBandwidth.toFixed(2));
          currentBandwidth = 0;
        }
      });
    }, 30000); // 30000 = 30 seconds
    state.manager?.agoraClient.registerEventHandler({
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
      onVolumeIndicator(result: { level: number; uid: UID }[]) {
        dispatch("setSpeakingUsers", result);
      },
      onLocalNetworkUpdate(payload: any) {
        //   Logger.log(payload);
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
    commit({ type: "lesson/clearCacheImage" }, { root: true });
  },
  async loadRooms({ commit, state }, _payload: any) {
    if (!state.user) return;
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(state.user.id, _payload);
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
  },
  async setStudentAudio({ commit, state }, payload: { id: string; enable: boolean; preventSendMsg?: boolean }) {
    if (payload.id === state.student?.id) {
      if (state.microphoneLock) return;
      commit("setMicrophoneLock", { enable: true });
      try {
        await state.manager?.setMicrophone({ enable: payload.enable });
        if (!payload.preventSendMsg) {
          await state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
        }
        commit("setStudentAudio", payload);
        commit("setMicrophoneLock", { enable: false });
      } catch (error) {
        commit("setMicrophoneLock", { enable: false });
      }
    } else {
      commit("setStudentAudio", payload);
    }
  },
  async setStudentVideo({ state, commit }, payload: { id: string; enable: boolean; preventSendMsg?: boolean }) {
    if (payload.id === state.student?.id) {
      if (state.cameraLock) return;
      try {
        commit("setCameraLock", { enable: true });
        await state.manager?.setCamera({ enable: payload.enable });
        if (!payload.preventSendMsg) {
          await state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
        }
        commit("setStudentVideo", payload);
        commit("setCameraLock", { enable: false });
      } catch (error) {
        commit("setCameraLock", { enable: false });
      }
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
    if (!state.info || !state.user) return;
    try {
      await RemoteTeachingService.studentAddShapes(payload, state.user.id, state.info.id);
    } catch (e) {
      Logger.log(e);
    }
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
  setTeacherDisconnected({ commit }, p: boolean) {
    commit("setTeacherDisconnected", p);
  },
  async getAvatarTeacher({ commit }, payload: { teacherId: string }) {
    const response = await InfoService.getAvatarTeacher(payload.teacherId);
    if (response) commit("setAvatarTeacher", response);
  },
  async setAvatarStudent({ commit }, payload: { studentId: string; oneToOne: boolean }) {
    const response = await StudentService.getAvatarStudent(payload.studentId);
    if (response) {
      if (payload.oneToOne) {
        commit("setAvatarStudentOneToOne", response);
      } else {
        commit("setAvatarCurrentStudent", response);
      }
    }
  },
  async studentDrawsLine({ state }, payload: Array<string>) {
    if (!state.info || !state.user) return;
    try {
      await RemoteTeachingService.studentDrawLine(payload, state.user.id, state.info.id);
    } catch (e) {
      Logger.log(e);
    }
  },
  toggleVideosFeed({ commit }) {
    commit("toggleVideosFeed");
  },
};

export default actions;
