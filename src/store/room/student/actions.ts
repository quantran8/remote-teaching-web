import { RoomModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import {
  GetClassesModel,
  RemoteTeachingService,
  StudentGetRoomResponse,
  TeacherGetRoomResponse,
  TeacherService,
} from "@/services";
import { Logger } from "@/utils/logger";
import { ActionTree } from "vuex";
import { InClassStatus } from "../interface";
import { useStudentRoomHandler } from "./handler";
import { StudentRoomState } from "./state";

const actions: ActionTree<StudentRoomState, any> = {
  async initClassRoom(
    { commit },
    payload: {
      classId: string;
      userId: string;
      userName: string;
      studentId: string;
      role: string;
    }
  ) {
    commit("setUser", {
      id: payload.studentId,
      name: payload.userName,
    });
    const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(
      payload.studentId
    );
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

  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  async updateAudioAndVideoFeed({ state }) {
    const { globalAudios, manager, students, teacher } = state;
    if (!manager) return;
    const cameras = students
      .filter((s) => s.videoEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
    let audios = students
      .filter((s) => s.audioEnabled && s.status === InClassStatus.JOINED)
      .map((s) => s.id);
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
    return manager?.updateAudioAndVideoFeed(cameras, audios);
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
    await state.manager?.WSClient.sendRequestJoinRoom(
      state.info?.id,
      state.user?.id
    );
    const eventHandler = useStudentRoomHandler(store);
    state.manager?.registerEventHandler(eventHandler);
    state.manager?.agoraClient.registerEventHandler({
      onUserPublished: (_payload) => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onUserUnPublished: () => {
        dispatch("updateAudioAndVideoFeed", {});
      },
      onException: (payload: any) => {
        Logger.error("Exception", payload);
      },
    });
  },

  async leaveRoom({ state, commit }, payload: any) {
    await state.manager?.close();
    commit("leaveRoom", payload);
  },
  async loadRooms({ commit, state }, _payload: any) {
    if (!state.user) return;
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(
      state.user.id
    );
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
  },
  async loadClasses({ commit }, { teacherId }: { teacherId: string }) {
    const response: GetClassesModel = await TeacherService.getClasses(
      teacherId
    );
    if (!response) return;
    commit("setClasses", response.data);
  },

  async setStudentAudio(
    { commit, state },
    payload: { id: string; enable: boolean }
  ) {
    if (payload.id === state.student?.id) {
      await state.manager?.setMicrophone({ enable: payload.enable });
      state.manager?.WSClient.sendRequestMuteAudio(!payload.enable);
    }
    commit("setStudentAudio", payload);
  },
  async setStudentVideo(
    { state, commit },
    payload: { id: string; enable: boolean }
  ) {
    if (payload.id === state.student?.id) {
      await state.manager?.setCamera({ enable: payload.enable });
      state.manager?.WSClient.sendRequestMuteVideo(!payload.enable);
    }
    commit("setStudentVideo", payload);
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
};

export default actions;
