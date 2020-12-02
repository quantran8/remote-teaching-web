import { AGORA_APP_ID } from "@/agora/config";
import { StudentRoomManager } from '@/manager/room/student.manager';
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { ClassView, StudentInClassStatus } from "../interface";
import { StudentRoomState } from "./state";

const mutations: MutationTree<StudentRoomState> = {
  setError(state: StudentRoomState, payload: GLError | null) {
    state.error = payload;
  },

  setClassView(state: StudentRoomState, payload: { classView: ClassView }) {
    state.classView = payload.classView;
  },
  setClasses(state: StudentRoomState, payload: Array<ClassModel>) {
    state.classes = payload;
  },
  setUser(state: StudentRoomState, payload: UserModel) {
    state.user = payload;
  },
  setRoomInfo(state: StudentRoomState, room: RoomModel) {
    state.teacher = {
      id: room.teacher.id,
      name: room.teacher.name,
      avatar: "",
      audioEnabled: false,
      videoEnabled: false,
    };
    state.students = [];
    for (const st of room.students) {
      const student = {
        id: st.id,
        name: st.name,
        avatar: "",
        audioEnabled: false,
        videoEnabled: false,
        badge: 0,
        status: StudentInClassStatus.DEFAULT,
        hasJoinned: false,
        index: state.students.length,
      };
      if (st.id === state.user?.id) {
        student.index = 999;
        state.student = student;
      } else {
        state.students.push(student);
      }
    }

    state.info = room;
    const role = "audience";
    state.manager = new StudentRoomManager({
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
    state: StudentRoomState,
    payload: { studentId: string; audioEnabled: boolean }
  ) {
    const student =
      payload.studentId === state.student?.id
        ? state.student
        : state.students.find((st) => st.id === payload.studentId);
    if (student) student.audioEnabled = payload.audioEnabled;
  },
  setStudentVideo(
    state: StudentRoomState,
    payload: { studentId: string; videoEnabled: boolean }
  ) {
    const student =
      payload.studentId === state.student?.id
        ? state.student
        : state.students.find((st) => st.id === payload.studentId);
    if (student) student.videoEnabled = payload.videoEnabled;
  },
  setStudentBadge(
    state: StudentRoomState,
    payload: { studentId: string; badge: number }
  ) {
    const student = state.students.find((st) => st.id === payload.studentId);
    if (student) student.badge = payload.badge;
  },
  setTeacherAudio(
    state: StudentRoomState,
    payload: { teacherId: string; audioEnabled: boolean }
  ) {
    if (state.teacher?.id === payload.teacherId)
      state.teacher.audioEnabled = payload.audioEnabled;
  },
  setTeacherVideo(
    state: StudentRoomState,
    payload: { teacherId: string; videoEnabled: boolean }
  ) {
    if (state.teacher?.id === payload.teacherId)
      state.teacher.videoEnabled = payload.videoEnabled;
  },

  hideAllStudents(state: StudentRoomState) {
    state.students.forEach((student) => (student.videoEnabled = false));
  },
  showAllStudents(state: StudentRoomState) {
    state.students.forEach((student) => (student.videoEnabled = true));
  },
  muteAllStudents(state: StudentRoomState) {
    state.students.forEach((student) => (student.audioEnabled = false));
  },
  unmuteAllStudents(state: StudentRoomState) {
    state.students.forEach((student) => (student.audioEnabled = true));
  },
  studentJoinned(state: StudentRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.JOINED;
  },
  studentLeftClass(state: StudentRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.LEFT;
  },
  studentLeaving(state: StudentRoomState, payload: { studentId: string }) {
    const student = state.students.find(
      (student) => student.id === payload.studentId
    );
    if (student) student.status = StudentInClassStatus.LEAVING;
  },
};

export default mutations;
