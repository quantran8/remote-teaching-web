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
        message: "This class is not active!",
      });
      return;
    }
    commit("setRoomInfo", roomResponse.data);
  },

  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  async joinRoom({ state }, _payload: any) {
    if (!state.manager?.isJoinedRoom()) {
      if (!state.info) return;
      await state.manager?.join({
        camera: state.student?.videoEnabled,
        microphone: state.student?.audioEnabled,
        classId: state.info?.id,
        studentId: state.user?.id,
      });
    }
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
    store,
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    store.commit("setStudentAudio", payload);
  },
  setStudentVideo(
    store,
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    store.commit("setStudentVideo", payload);
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
