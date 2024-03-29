import { ErrorLocale, TeacherClassError } from "@/locales/localeid";
import { MediaStatus, RoomModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import router from "@/router";
import {
	InfoService,
	RemoteTeachingService,
	StudentGetRoomResponse,
	StudentService,
	StudentStorageService,
	TeacherGetRoomResponse
} from "@/services";
import { store } from "@/store";
import { UserRole } from "@/store/app/state";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";
import { Logger } from "@/utils/logger";
import { Paths } from "@/utils/paths";
import { isMobileBrowser } from "@/utils/utils";
import { HubConnectionState } from "@microsoft/signalr";
import { UID } from "agora-rtc-sdk-ng";
import { notification } from "ant-design-vue";
import { ErrorCode, fmtMsg } from "vue-glcommonui";
import { ActionTree } from "vuex";
import { ClassViewFromValue, ClassViewPayload, HelperInClassStatus, InClassStatus } from "../interface";
import { useStudentRoomHandler } from "./handler";
import { StudentRoomState } from "./state";

const actions: ActionTree<StudentRoomState, any> = {
  async getClassRoomInfo({ dispatch, state }) {
    if (!state.info?.id) return;
    const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetSessionById(state.info?.id);
    const roomInfo: RoomModel = roomResponse.data;
    await dispatch("setClassData", roomInfo);
  },
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
      commit("setBrowserFingerPrint", payload.browserFingerPrinting);
      await dispatch("setClassData", roomInfo);
      await store.dispatch("setVideoCallPlatform", roomResponse.data.videoPlatformProvider);
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("interactive/setInfo", roomResponse.data.lessonPlan.interactive, {
        root: true,
      });
      await dispatch("interactive/setCurrentUserId", state.user?.id, {
        root: true,
      });
      await dispatch("setTeacherMessageVersion", roomResponse.data.teacher.messageVersion, { root: true });
      if (roomResponse.data.teacher.disconnectTime) {
        commit("setTeacherDisconnected", true);
        //check for teacher connected status while student's signalR has not initialized properly to get
        //the TeacherJoinedClass event. Workaround for a bug user refresh teacher's screen and student's screen at same time!
        const maxRetry = 5;
        let currentTry = 1;
        let teacherConnected = false;

        const intervalId = setInterval(async () => {
          if (currentTry > maxRetry || teacherConnected || store.getters.singalrInited) {
            clearInterval(intervalId);
            Logger.log(`Stopped loop, currentTry ${currentTry}, teacherConnected ${teacherConnected}, signalRinited ${store.getters.singalrInited}`);
          }

          Logger.log("CALL JOIN CLASS AGAIN");

          const roomResponse2: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(
            payload.studentId,
            payload.browserFingerPrinting,
          );
          if (!roomResponse2.data.teacher.disconnectTime) {
            teacherConnected = true;
            Logger.log("SET TEACHER ONLINE");
            commit("setTeacherDisconnected", false);
            commit("setTeacherStatus", {
              id: roomResponse2.data.teacher.id,
              status: roomResponse2.data.teacher.connectionStatus,
            });
          }
          currentTry += 1;
        }, 1000);
      }
    } catch (error) {
      await dispatch("setApiError", error);
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
    const { globalAudios, manager, students, teacher, idOne, student, videosFeedVisible, helper } = state;
    if (!manager) return;
    const cameras = students
      .filter((s) => {
        if (!videosFeedVisible || isMobileBrowser) return false;
        return s.videoEnabled && s.status === InClassStatus.JOINED;
      })
      .map((s) => s.id);
    let audios = students.filter((s) => s.audioEnabled && s.status === InClassStatus.JOINED).map((s) => s.id);
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
    if (helper) {
      // condition to subscribe helper's video
      if (!helper.isMuteVideo && helper.connectionStatus !== HelperInClassStatus.Disconnected && helper.isVideoShownByTeacher) {
        cameras.push(helper.id);
      }
      if (!helper.isMuteAudio) {
        audios.push(helper.id);
      }
    }
    if (idOne) {
      //handle one to one student
      if (idOne === student?.id) {
        const cameraOtherStudentId = cameras.filter((camId) => camId !== idOne && camId !== teacher?.id);
        const audioOtherStudentId = audios.filter((audioId) => audioId !== idOne && audioId !== teacher?.id);
        for (const id of cameraOtherStudentId) {
          const cameraIndex = cameras.findIndex((camId) => camId === id);
          cameras.splice(cameraIndex, 1);
        }
        for (const id of audioOtherStudentId) {
          const audioIndex = audios.findIndex((audioId) => audioId === id);
          audios.splice(audioIndex, 1);
        }
      }

      //handle other students
      if (idOne !== student?.id) {
        //remove student one to one
        const studentCameraIndex = cameras.findIndex((camId) => camId === idOne);
        if (studentCameraIndex > -1) {
          cameras.splice(studentCameraIndex, 1);
        }
        const studentAudioIndex = audios.findIndex((audioId) => audioId === idOne);
        if (studentAudioIndex > -1) {
          audios.splice(studentAudioIndex, 1);
        }
        //remove teacher one to one
        const teacherCameraIndex = cameras.findIndex((camId) => camId === teacher?.id);
        if (teacherCameraIndex > -1) {
          cameras.splice(teacherCameraIndex, 1);
        }
        const teacherAudioIndex = audios.findIndex((audioId) => audioId === teacher?.id);
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
        idOne: state.idOne,
        reJoin: _payload ? _payload.reJoin : false,
        isMirror: state.info.isStudentVideoMirror,
        isRemoteMirror: state.info.isTeacherVideoMirror,
      });
    }
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
        if (currentBandwidth && state.user && state.user.id) {
          //mean 5 minutes
          Logger.info("LOG BANDWIDTH", currentBandwidth.toFixed(2));
          RemoteTeachingService.putStudentBandwidth(state.user.id, currentBandwidth.toFixed(2));
          currentBandwidth = 0;
        }
      });
    }, 300000); // 300000 = 5 minutes

    (window as any)["intervalLogBandwidth"] = interval;

    //if (store.getters.platform === VCPlatform.Agora) {
    state.manager?.agoraClient?.registerEventHandler({
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
      onLocalNetworkUpdate(payload: any) {
        Logger.log(payload);
      },
    });
    //}
    var checkMessageTimer = setInterval(async () => {
      try {
        if (state.manager?.WSClient.hubConnection.state != HubConnectionState.Connected) return;
        var techerMessageVersion = await state.manager?.WSClient.sendCheckTeacherMessageVersion();
        const localMessageVersion = store.rootGetters["teacherMessageVersion"];
        if (techerMessageVersion > localMessageVersion) {
          console.log(`TEACHER MESSAGE VERSION: server ${techerMessageVersion} local ${localMessageVersion} `);
          //reinit the class data here
          notification.error({ message: fmtMsg(TeacherClassError.MissingImportantClassMessages) });
          const user = store.getters["user"] as UserModel;
          const room = store.getters["info"] as RoomModel;
          await dispatch("initClassRoom", {
            classId: room.classInfo.classId,
            userId: user.id,
            userName: user.name,
            studentId: user.id,
            role: "parent",
            browserFingerPrinting: store.getters["browserFingerPrint"],
          });
          console.log("REINIT CLASS INFO OK");
        }
      } catch (err) {
        //error here loss signalR network, for loss API connection
        //disconnect now because window.offline event not work correctly sometimes
        if (store.getters["isDisconnected"] == false) {
          console.log("PING FAILED- SHOULD DISCONNECT STUDENT");
          //dispatch("setOffline");
        }
      }
    }, 3000);
    store.dispatch("setCheckMessageVersionTimer", checkMessageTimer, { root: true });
  },
  setSpeakingUsers({ commit }, payload: { level: number; uid: UID }[]) {
    const validSpeakings: Array<string> = [];
    if (payload) {
      payload.map((item) => {
        if (item.level >= MIN_SPEAKING_LEVEL) {
          // should check by a level
          validSpeakings.push(item.uid.toString());
        }
      });
    }
    commit("setSpeakingUsers", { userIds: validSpeakings });
  },
  async leaveRoom({ state, commit, rootGetters, dispatch }, payload: any) {
    await state.manager?.close(payload?.leave);
    commit("leaveRoom", payload);
    commit({ type: "lesson/clearLessonData" }, { root: true });
    commit({ type: "lesson/clearCacheImage" }, { root: true });
    const checkMessageTimer = rootGetters["checkMessageVersionTimer"];
    if (checkMessageTimer) clearInterval(checkMessageTimer);
    dispatch("setCheckMessageVersionTimer", -1, { root: true });
    dispatch("annotation/clearPencilPath", null, { root: true });
    dispatch("annotation/addShape", null, { root: true });
    dispatch("lesson/setZoomRatio", undefined, { root: true });
    dispatch("lesson/setImgCoords", undefined, { root: true });
    dispatch("annotation/setLastFabricUpdated", null, { root: true });
  },
  async loadRooms({ commit, dispatch, state }, _payload: any) {
    if (!state.user) return;
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(state.user.id, _payload);
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
    await store.dispatch("setVideoCallPlatform", roomResponse.data.videoPlatformProvider);
  },
  async setStudentAudio({ commit, state }, payload: { id: string; enable: boolean; preventSendMsg?: boolean }) {
    if (payload.id === state.student?.id) {
      if (state.microphoneLock) return;
      commit("setMicrophoneLock", { enable: true });
      try {
        commit("setStudentAudio", payload);
        await state.manager?.setMicrophone({ enable: payload.enable });
        if (!payload.preventSendMsg) {
          await state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
        }
        commit("setMicrophoneLock", { enable: false });
      } catch (error) {
        Logger.error("SET_STUDENT_AUDIO_ERROR", error);
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
        commit("setStudentVideo", payload);
        await state.manager?.setCamera({ enable: payload.enable });
        if (!payload.preventSendMsg) {
          await state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
        }
        commit("setCameraLock", { enable: false });
      } catch (error) {
        Logger.error("SET_STUDENT_VIDEO_ERROR", error);
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
  async studentRaisingHand(store, payload: boolean) {
    store.commit("setStudentRaisingHand", {
      raisingHand: payload,
    });
    await store.state.manager?.WSClient.sendRequestRaisingHand(payload);
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
  async setStudentOneId({ state, commit, dispatch }, p: { id: string }) {
    commit("setStudentOneId", p);
    // if (p.id) {
    // 	if (store.getters["platform"] === VCPlatform.Zoom) {
    // 		await dispatch("generateOneToOneToken", {
    // 			classId: store.getters["studentRoom/info"]?.id,
    // 			studentId: p.id,
    // 		});
    // 	}
    // }
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
  setOffline({ commit, rootState }) {
    if (rootState.app.userRole === UserRole.Student) {
      commit("setOffline");
    }
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
  setTargetsVisibleListAction({ state }, payload: any) {
    state.manager?.WSClient.sendRequestToggleShape(payload);
  },
  async generateOneToOneToken({ state }, payload: { classId: string; studentId: string }) {
    try {
      const zoom = state.manager?.zoomClient;
      if (zoom) {
        await zoom.studentJoinOneToOneSubSession();
      }
    } catch (error) {
      Logger.log(error);
    }
  },
  setStudentImageCaptured({ commit }, p: { id: string; capture: boolean }) {
    commit("setStudentImageCaptured", p);
  },
  async uploadCapturedImage({ state, commit }, p: { token: string; formData: FormData; fileName: string; studentId: string }) {
    try {
      await StudentStorageService.uploadFile(p.token, p.formData);
      const count = state.student ? state.student.imageCapturedCount + 1 : 1;
      commit("setStudentImageCapturedCount", count);
      state.manager?.WSClient.sendCapturedImageStatus({
        StudentId: p.studentId,
        FileName: p.fileName,
        ImageCapturedCount: count,
        IsUploaded: true,
        Error: "",
      });
    } catch (error) {
      state.manager?.WSClient.sendCapturedImageStatus({
        StudentId: p.studentId,
        FileName: "",
        ImageCapturedCount: 0,
        IsUploaded: false,
        Error: error.message,
      });
      Logger.log(error);
    }
  },
  async setRoomInfo({ commit }, p: TeacherGetRoomResponse) {
    commit("setRoomInfo", p);
  },
  async setClassData({ commit, dispatch, state }, roomInfo: RoomModel) {
    commit("setRoomInfo", roomInfo);
    await dispatch(
      "lesson/setInfo",
      { lessonPlan: roomInfo?.lessonPlan, isSetCurrentExposure: !(state.student?.id === roomInfo.studentOneToOne) },
      { root: true },
    );
    await dispatch("annotation/setInfo", roomInfo.annotation, {
      root: true,
    });
    commit("setClassView", {
      classView: ClassViewFromValue(roomInfo.teachingMode),
    });
    commit("setWhiteboard", roomInfo.isShowWhiteBoard);
    await dispatch(
      "lesson/setTargetsVisibleAllAction",
      { user: "", visible: roomInfo.annotation?.drawing?.isShowingAllShapes ?? false },
      { root: true },
    );
    await dispatch("lesson/setTargetsVisibleListJoinedAction", roomInfo.annotation?.drawing?.visibleShapes ?? [], { root: true });
    if (roomInfo.studentOneToOne) {
      await dispatch("studentRoom/setStudentOneId", { id: roomInfo.studentOneToOne }, { root: true });
      if (state.student?.id === roomInfo.studentOneToOne) {
        await dispatch("setClassView", { classView: ClassViewFromValue(roomInfo.oneAndOneDto.teachingMode) });
        commit("lesson/setCurrentExposure", { id: roomInfo.oneAndOneDto.exposureSelected }, { root: true });
        commit("lesson/setCurrentExposureItemMedia", { id: roomInfo.oneAndOneDto.itemContentSelected }, { root: true });
        commit("updateIsPalette", {
          id: roomInfo.oneAndOneDto.id,
          isPalette: roomInfo.oneAndOneDto.isEnablePalette,
        });
        commit("setWhiteboard", roomInfo.oneAndOneDto.isShowWhiteBoard);
        await dispatch(
          "lesson/setTargetsVisibleAllAction",
          { user: "", visible: roomInfo.annotation.oneOneDrawing.isShowingAllShapes },
          { root: true },
        );
        await dispatch("lesson/setTargetsVisibleListJoinedAction", roomInfo.annotation.oneOneDrawing.visibleShapes, { root: true });
        await dispatch("annotation/setOneTeacherStrokes", roomInfo.annotation.oneOneDrawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: roomInfo.annotation.oneOneDrawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: roomInfo.annotation.oneOneDrawing.shapes }, { root: true });
        await dispatch("annotation/setOneStudentStrokes", roomInfo.annotation.oneOneDrawing.studentBrushstrokes, { root: true });
        await dispatch("annotation/setFabricsInOneMode", roomInfo.annotation.oneOneDrawing.fabrics, { root: true });
        await dispatch("lesson/setZoomRatio", roomInfo.oneAndOneDto.ratio, { root: true });
        if (roomInfo.oneAndOneDto.position) {
          await dispatch("lesson/setImgCoords", { x: roomInfo.oneAndOneDto.position.x, y: roomInfo.oneAndOneDto.position.y }, { root: true });
        }
      } else {
        await dispatch("lesson/setZoomRatio", roomInfo.lessonPlan.ratio, { root: true });
        if (roomInfo.lessonPlan.position) {
          await dispatch("lesson/setImgCoords", { x: roomInfo.lessonPlan.position.x, y: roomInfo.lessonPlan.position.y }, { root: true });
        }
      }
    } else {
      await dispatch("lesson/setZoomRatio", roomInfo.lessonPlan.ratio, { root: true });
      if (roomInfo.lessonPlan.position) {
        await dispatch("lesson/setImgCoords", { x: roomInfo.lessonPlan.position.x, y: roomInfo.lessonPlan.position.y }, { root: true });
      }
      await dispatch("studentRoom/clearStudentOneId", { id: "" }, { root: true });
    }
  },
  async getClassRoomStatus({ commit, dispatch }, p: { id: string; bfp: string }) {
    try {
      const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(p.id, p.bfp);
      const roomInfo: RoomModel = roomResponse.data;
      if (!roomInfo) {
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
    } catch (error) {
      await dispatch("setApiError", error);
    }
  },
  async setApiError({ commit }, payload: any) {
    if (payload.code == null) {
      commit("setApiStatus", {
        code: GLErrorCode.DISCONNECT,
        message: "",
      });
      return Logger.log(payload);
    }
    if (payload.code === ErrorCode.ConcurrentUserException) {
      await router.push(Paths.Home);
    } else if (payload.code === ErrorCode.StudentNotInClass) {
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
  },
};

export default actions;
