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
import { WSEventHandler } from "@/ws";
import { ActionTree } from "vuex";
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
  async joinRoom({ state, commit }, _payload: any) {
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
    const eventHandler: WSEventHandler = {
      onStudentJoinClass: (payload: any) => {
        console.log(payload);
      },
      onStudentStreamConnect: (payload: any) => {
        console.log(payload);
      },
      onStudentMuteAudio: (payload: StudentModel) => {
        console.log(payload);
      },
      onStudentMuteVideo: (payload: StudentModel) => {
        console.log(payload);
      },
      onStudentLeave: (payload: any) => {
        console.log(payload);
      },
      onStudentDisconnected: (payload: any) => {
        console.log(payload);
      },

      onTeacherJoinClass: (payload: any) => {
        console.log(payload);
      },
      onTeacherStreamConnect: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteVideo: (payload: any) => {
        console.log(payload);
      },
      onTeacherMuteStudentVideo: (payload: StudentModel) => {
        commit("setStudentVideo", {
          studentId: payload.id,
          videoEnabled: !payload.isMuteVideo,
        });
      },
      onTeacherMuteStudentAudio: (payload: StudentModel) => {
        commit("setStudentAudio", {
          studentId: payload.id,
          audioEnabled: !payload.isMuteAudio,
        });
      },
      onTeacherMuteAllStudentVideo: (payload: Array<StudentModel>) => {
        for (const student of payload) {
          commit("setStudentVideo", {
            studentId: student.id,
            videoEnabled: !student.isMuteVideo,
          });
        }
      },
      onTeacherMuteAllStudentAudio: (payload: Array<StudentModel>) => {
        for (const student of payload) {
          commit("setStudentAudio", {
            studentId: student.id,
            audioEnabled: !student.isMuteAudio,
          });
        }
      },
      onTeacherEndClass: (payload: any) => {
        commit("setError", {
          errorCode: GLErrorCode.CLASS_HAS_BEEN_ENDED,
          message: "Your class has been ended!",
        });
      },
      onTeacherDisconnect: (payload: any) => {
        console.log("onTeacherDisconnect", payload);
      },
      onTeacherSetFocusTab: (payload: any) => {
        console.log(payload);
      },
      onTeacherUpdateGlobalStudentAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherUpdateStudentAudio: (payload: any) => {
        console.log(payload);
      },
      onTeacherUpdateStudentBadge: (payload: StudentModel) => {
        commit("setStudentBadge", {
          studentId: payload.id,
          badge: payload.badge,
        });
      },
    };

    state.manager?.registerEventHandler(eventHandler);
  },

  async leaveRoom({ state }, _payload: any) {
    state.manager?.close();
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

  setStudentAudio(
    { commit, state },
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    commit("setStudentAudio", payload);
    state.manager?.WSClient.sendRequestMuteAudio(!payload.audioEnabled);
  },
  setStudentVideo(
    { state, commit },
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    commit("setStudentVideo", payload);
    state.manager?.WSClient.sendRequestMuteVideo(!payload.videoEnabled);
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
