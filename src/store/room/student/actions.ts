import { UserModel } from "@/models/user.model";
import {
  GetClassesModel,
  RemoteTeachingService,
  TeacherGetRoomResponse,
  TeacherService,
} from "@/services";
import { ActionTree } from "vuex";
import { RoomState } from "./state";

const actions: ActionTree<RoomState, any> = {
  setUser({ commit }, payload: UserModel) {
    commit("setUser", payload);
  },
  async joinRoom({ state }, _payload: any) {
    if (!state.manager?.isJoinedRoom()) {
      await state.manager?.join({
        camera: true,
        microphone: false,
        publish: true,
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

  // for camera
  async openCamera(_store, _payload) {
    // TO DO
  },
  async muteLocalCamera(_store, _payload) {
    // TO DO
  },
  async unmuteLocalCamera(_store, _payload) {
    // TO DO
  },
  async lockLocalCamera(_store, _payload) {
    // TO DO
  },
  async unlockLocalCamera(_store, _payload) {
    // TO DO
  },
  async closeCamera(_store, _payload) {
    // TO DO
  },
  async changeCamera(_store, _payload: { deviceId: string }) {
    // TO DO
  },

  // for microphone
  async muteLocalMicrophone(_store, _payload) {
    // TO DO
  },
  async unmuteLocalMicrophone(_store, _payload) {
    // TO DO
  },
  async lockMicrophone(_store, _payload) {
    // TO DO
  },
  async unLockMicrophone(_store, _payload) {
    // TO DO
  },
  async openMicrophone(_store, _payload) {
    // TO DO
  },
  async closeMicrophone(_store, _payload) {
    // TO DO
  },
  async changeMicrophone(_store, _payload: { deviceId: string }) {
    // TO DO
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
