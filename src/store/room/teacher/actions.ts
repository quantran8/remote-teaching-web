import { AgoraEventHandler } from "@/agora";
import { GLError, GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import {
  LessonService,
  RemoteTeachingService,
  TeacherGetRoomResponse,
} from "@/services";
import { ActionTree } from "vuex";
import { ClassView, InClassStatus, ValueOfClassView } from "../interface";
import { TeacherRoomState } from "./state";
import { useTeacherRoomWSHandler } from "./handler";
import { RoomModel } from "@/models";
import { Logger } from "@/utils/logger";

interface InitClassRoomPayload {
  classId: string;
  userId: string;
  userName: string;
  role: string;
}

interface SetStudentAudioPayload {
  studentId: string;
  audioEnabled: boolean;
}

interface SetStudentVideoPayload {
  studentId: string;
  videoEnabled: boolean;
}

interface SetStudentBadgePayload {
  studentId: string;
  badge: number;
}

interface SetTeacherAudioPayload {
  teacherId: string;
  audioEnabled: boolean;
}

interface SetTeacherVideoPayload {
  teacherId: string;
  videoEnabled: boolean;
}

interface SetClassViewPayload {
  classView: ClassView;
}

interface AddGlobalAudioPayload {
  studentId: string;
}

interface AddLocalAudioPayload {
  studentId: string;
}

interface OnStudentJoinedPayload {
  studentId: string;
}

interface OnStudentLeftPayload {
  studentId: string;
}

interface OnStudentLeavingPayload {
  studentId: string;
}

const actions: ActionTree<TeacherRoomState, any> = {
  async endClass({ commit, state }, payload: any) {
    if (state.info) {
      await state.manager?.WSClient.sendRequestEndRoom(state.info?.id);
    }
    commit("endClass", payload);
  },
  setClassView({ state }, payload: SetClassViewPayload) {
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
    const { globalAudios, localAudios, manager, students } = state;
    if (!manager) return;
    const cameras = students
      .filter((s) => s.videoEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
    let audios = students
      .filter((s) => s.audioEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
    if (localAudios.length > 0) {
      audios = localAudios.map((s) => s.studentId);
    } else if (globalAudios.length > 0) {
      audios = globalAudios.map((s) => s.studentId);
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
    commit("setUser", {
      id: payload.userId,
      name: payload.userName,
    });
    let roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    if (!roomResponse) {
      // start class room
      const lessons = await LessonService.getLessonByUnit(11);
      let lesson = lessons.find((ele) => parseInt(ele.title) === 16);
      if (!lesson) lesson = lessons[0];
      const createRoomResponse = await RemoteTeachingService.teacherStartClassRoom(
        payload.classId,
        lesson.id
      );
      if (createRoomResponse) {
        roomResponse = await RemoteTeachingService.getActiveClassRoom();
        if (!roomResponse) {
          // Cannot start class room
          return;
        }
      } else {
        return;
      }
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

  async setStudentAudio({ state, commit }, payload: SetStudentAudioPayload) {
    await state.manager?.WSClient.sendRequestMuteStudentAudio(
      payload.studentId,
      !payload.audioEnabled
    );
    commit("setStudentAudio", payload);
  },
  async setStudentVideo({ state, commit }, payload: SetStudentVideoPayload) {
    commit("setStudentVideo", payload);
    state.manager?.WSClient.sendRequestMuteStudentVideo(
      payload.studentId,
      !payload.videoEnabled
    );
  },
  setStudentBadge({ state }, payload: SetStudentBadgePayload) {
    state.manager?.WSClient.sendRequestSetStudentBadge(
      payload.studentId,
      payload.badge
    );
  },

  async setTeacherAudio({ state, commit }, payload: SetTeacherAudioPayload) {
    if (state.microphoneLock) return;
    commit("setMicrophoneLock", { enable: true });
    await state.manager?.WSClient.sendRequestMuteAudio(!payload.audioEnabled);
    await state.manager?.setMicrophone({
      enable: payload.audioEnabled,
    });
    commit("setTeacherAudio", payload);
    commit("setMicrophoneLock", { enable: false });
  },

  async setTeacherVideo({ state, commit }, payload: SetTeacherVideoPayload) {
    if (state.cameraLock) return;
    commit("setCameraLock", { enable: true });
    await state.manager?.WSClient.sendRequestMuteVideo(!payload.videoEnabled);
    await state.manager?.setCamera({
      enable: payload.videoEnabled,
    });
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
  studentJoinned(store, payload: OnStudentJoinedPayload) {
    store.commit("studentJoinned", payload);
  },
  studentLeftClass(store, payload: OnStudentLeftPayload) {
    store.commit("studentLeftClass", payload);
  },
  studentLeaving(store, payload: OnStudentLeavingPayload) {
    store.commit("studentLeaving", payload);
  },
  addGlobalAudio({ state }, payload: AddGlobalAudioPayload) {
    state.manager?.WSClient.sendRequestAddGlobalAudio(payload.studentId);
  },
  clearGlobalAudio({ state }, _payload: any) {
    state.manager?.WSClient.sendRequestClearGlobalAudio();
  },
  addStudentAudio({ state }, payload: AddLocalAudioPayload) {
    state.manager?.WSClient.sendRequestAddStudentAudio(payload.studentId);
  },
  clearStudentAudio({ state }, _payload: any) {
    state.manager?.WSClient.sendRequestClearStudentAudio();
  },
};

export default actions;
