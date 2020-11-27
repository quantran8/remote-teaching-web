import { AGORA_APP_ID } from "@/agora/config";
import { RoomManager } from "@/manager/room/base.manager";
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { ClassView, StudentInClassStatus } from "../interface";
import { TeacherRoomState } from "./state";

const mutations: MutationTree<TeacherRoomState> = {
  endClass(state: TeacherRoomState, payload: any) {
    state.manager?.close();
    state.info = undefined;
    state.user = undefined;
    state.teacher = undefined;
    state.students = [];
    state.manager = undefined;
    state.classes = [];
    state.classView = ClassView.GALLERY;
  },
  setClassView(state: TeacherRoomState, payload: { classView: ClassView }) {
    state.classView = payload.classView;
  },
  setError(state: TeacherRoomState, payload: GLError | null) {
    state.error = payload;
  },
  setClasses(state: TeacherRoomState, payload: Array<ClassModel>) {
    state.classes = payload;
  },
  setUser(state: TeacherRoomState, payload: UserModel) {
    state.user = payload;
  },
  setRoomInfo(state: TeacherRoomState, room: RoomModel) {
    state.teacher = {
      id: room.teacher.id,
      name: room.teacher.name,
      avatar: "",
      audioEnabled: false,
      videoEnabled: false,
    };
    state.students = room.students.map((st, index) => {
      return {
        id: st.id,
        name: st.name,
        avatar: "",
        audioEnabled: false,
        videoEnabled: false,
        badge: 0,
        status: StudentInClassStatus.DEFAULT,
        hasJoinned: false,
        index: index,
      };
    });
    state.info = room;
    const role =
      room.streamInfo.userId === room.teacher.id ? "host" : "audience";
    state.manager = new RoomManager({
      agora: {
        appId: AGORA_APP_ID,
        webConfig: { mode: "rtc", codec: "vp8", role: role },
        user: {
          channel: room.streamInfo.chanelId,
          username: room.streamInfo.userId,
          token: room.streamInfo.token,
          role,
        },
      },
    });
  },

  setStudentAudio(
    state: TeacherRoomState,
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.audioEnabled = payload.audioEnabled;
  },
  setStudentVideo(
    state: TeacherRoomState,
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.videoEnabled = payload.videoEnabled;
  },
  setStudentBadge(
    state: TeacherRoomState,
    payload: { studentId: string; badge: number }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.badge = payload.badge;
  },
  setTeacherAudio(
    state: TeacherRoomState,
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    if (state.teacher?.id === payload.teacherId)
      state.teacher.audioEnabled = payload.audioEnabled;
  },
  setTeacherVideo(
    state: TeacherRoomState,
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    if (state.teacher?.id === payload.teacherId)
      state.teacher.videoEnabled = payload.videoEnabled;
  },

  hideAllStudents(state: TeacherRoomState) {
    state.students.forEach((student) => (student.videoEnabled = false));
  },
  showAllStudents(state: TeacherRoomState) {
    state.students.forEach((student) => (student.videoEnabled = true));
  },
  muteAllStudents(state: TeacherRoomState) {
    state.students.forEach((student) => (student.audioEnabled = false));
  },
  unmuteAllStudents(state: TeacherRoomState) {
    state.students.forEach((student) => (student.audioEnabled = true));
  },
  studentJoinned(state: TeacherRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.JOINED;
  },
  studentLeftClass(state: TeacherRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.LEFT;
  },
  studentLeaving(state: TeacherRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.LEAVING;
  },
};

export default mutations;