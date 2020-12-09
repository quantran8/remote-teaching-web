import { RoomModel, StudentModel } from "@/models";
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
  async userUnPublished({ state }, payload: any) {
    state.manager?.unsubcriseRemoteUser(payload);
  },
  async updateAudioAndVideoFeed({ state }, payload: any) {
    // const { globalAudios, teacher, manager, students } = state;
    // if (teacher && manager) {
    //   await manager?.subcriseRemoteUsers(globalAudios, teacher.id);
    //   const remoteAudios = manager?.agoraClient.subscribedAudios.map(
    //     (s) => s.userId
    //   );
    //   if (remoteAudios) {
    //     const remoteAudioStudents = students
    //       .filter((student) => {
    //         return remoteAudios.indexOf(student.id) !== -1;
    //       })
    //       .map((st) => st.name);
    //     remoteAudioStudents.push(teacher.name);
    //     console.log("Subscrise Remote Audios:", remoteAudioStudents.join(","));
    //   }
    // }

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
      onUserUnPublished: (user, mediaType) => {
        console.log("User UnPublished", user.uid);
        dispatch("userUnPublished", {
          user,
          mediaType,
        });
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
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    if (payload.studentId === state.student?.id) {
      await state.manager?.setMicrophone({ enable: payload.audioEnabled });
      state.manager?.WSClient.sendRequestMuteAudio(!payload.audioEnabled);
    }
    commit("setStudentAudio", payload);
  },
  async setStudentVideo(
    { state, commit },
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    if (payload.studentId === state.student?.id) {
      await state.manager?.setCamera({ enable: payload.videoEnabled });
      state.manager?.WSClient.sendRequestMuteVideo(!payload.videoEnabled);
    }
    commit("setStudentVideo", payload);
  },

  setStudentBadge(store, payload: { studentId: string; badge: number }) {
    store.commit("setStudentBadge", payload);
  },

  setTeacherAudio(
    store,
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    store.commit("setTeacherAudio", payload);
  },

  setTeacherVideo(
    store,
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    store.commit("setTeacherVideo", payload);
  },
  hideAllStudents(store) {
    store.commit("hideAllStudents", {});
  },
  showAllStudents(store) {
    store.commit("showAllStudents", {});
  },
  muteAllStudents(store) {
    store.commit("muteAllStudents", {});
  },
  unmuteAllStudents(store) {
    store.commit("unmuteAllStudents", {});
  },
  studentJoinned(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
  studentLeftClass(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
  studentLeaving(store, payload: { studentId: string }) {
    store.commit("studentJoinned", payload);
  },
};

export default actions;
