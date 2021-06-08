import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { ClassView, InClassStatus } from "../interface";
import { ClassAction, ClassActionFromValue, StudentRoomState } from "./state";

const mutations: MutationTree<StudentRoomState> = {
  setCameraLock(
    state: StudentRoomState,
    payload: {
      enable: boolean;
    },
  ) {
    state.cameraLock = payload.enable;
  },
  setMicrophoneLock(
    state: StudentRoomState,
    payload: {
      enable: boolean;
    },
  ) {
    state.microphoneLock = payload.enable;
  },
  setGlobalAudios(state: StudentRoomState, payload: Array<string>) {
    state.globalAudios = payload;
  },
  leaveRoom(state: StudentRoomState, _payload: any) {
    state.manager = undefined;
    state.info = undefined;
    state.user = undefined;
    state.teacher = undefined;
    state.students = [];
    state.manager = undefined;
    state.classes = [];
    state.classView = ClassView.GALLERY;
    state.error = null;
    state.globalAudios = [];
    state.idOne = "";
  },
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
    state.idOne = room.studentOneToOne ? room.studentOneToOne : "";
    state.teacher = {
      id: room.teacher.id,
      name: room.teacher.name,
      avatar: "",
      audioEnabled: !room.teacher.isMuteAudio,
      videoEnabled: !room.teacher.isMuteVideo,
      status: room.teacher.connectionStatus,
    };
    state.students = [];
    for (const st of room.students) {
      const student = {
        id: st.id,
        name: st.name,
        englishName: st.englishName,
        avatar: "",
        audioEnabled: !st.isMuteAudio,
        videoEnabled: !st.isMuteVideo,
        badge: st.badge,
        status: st.connectionStatus,
        index: state.students.length,
        raisingHand: st.isRaisingHand,
        isPalette: st.isPalette,
      };
      if (st.id === state.user?.id) {
        student.index = 999;
        state.student = student;
      } else {
        state.students.push(student);
      }
    }
    state.globalAudios = room.globalStudentsAudio;
    state.info = room;
    const role = "audience";
    if (!state.manager)
      state.manager = new StudentRoomManager({
        agora: {
          appId: room.streamInfo.appId,
          webConfig: { mode: "rtc", codec: "vp8", role: role },
          user: {
            channel: room.streamInfo.chanelId,
            username: room.streamInfo.userId,
            token: room.streamInfo.token,
            role,
          },
        },
      });

    state.classAction = ClassActionFromValue(room.lessonPlan.lessonAction);
  },
  setStudentAudio(state: StudentRoomState, payload: { id: string; enable: boolean }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find(st => st.id === payload.id);
    if (student) student.audioEnabled = payload.enable;
  },
  setStudentStatus(state: StudentRoomState, payload: { id: string; status: InClassStatus }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find(st => st.id === payload.id);
    if (student) student.status = payload.status;
  },
  setStudentVideo(state: StudentRoomState, payload: { id: string; enable: boolean }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find(st => st.id === payload.id);
    if (student) student.videoEnabled = payload.enable;
  },
  setStudentBadge(state: StudentRoomState, payload: { id: string; badge: number }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find(st => st.id === payload.id);
    if (student) student.badge = payload.badge;
  },
  setTeacherAudio(state: StudentRoomState, payload: { id: string; enable: boolean }) {
    if (state.teacher?.id === payload.id) state.teacher.audioEnabled = payload.enable;
  },
  setTeacherVideo(state: StudentRoomState, payload: { id: string; enable: boolean }) {
    if (state.teacher?.id === payload.id) state.teacher.videoEnabled = payload.enable;
  },
  setTeacherStatus(state: StudentRoomState, payload: { id: string; status: InClassStatus }) {
    if (state.teacher?.id === payload.id) state.teacher.status = payload.status;
  },

  hideAllStudents(state: StudentRoomState) {
    state.students.forEach(student => (student.videoEnabled = false));
  },
  showAllStudents(state: StudentRoomState) {
    state.students.forEach(student => (student.videoEnabled = true));
  },
  muteAllStudents(state: StudentRoomState) {
    state.students.forEach(student => (student.audioEnabled = false));
  },
  unmuteAllStudents(state: StudentRoomState) {
    state.students.forEach(student => (student.audioEnabled = true));
  },
  setClassAction(state: StudentRoomState, payload: { action: ClassAction }) {
    state.classAction = payload.action;
  },
  setStudentOneId(s: StudentRoomState, p: { id: string }) {
    s.idOne = p.id;
  },
  clearStudentOneId(s: StudentRoomState, p: { id: string }) {
    s.idOne = p.id;
  },
  setSpeakingUsers(state: StudentRoomState, payload: { userIds: Array<string> }) {
    state.speakingUsers = payload.userIds;
  },
  setStudentRaisingHand(state: StudentRoomState, payload: { id: string; raisingHand: boolean }) {
    if (!payload.id && state.student?.id) {
      payload.id = state.student.id;
    }
    const student = payload.id === state.student?.id ? state.student : state.students.find(st => st.id === payload.id);
    if (student) student.raisingHand = payload.raisingHand;
  },
  setWhiteboard(state: StudentRoomState, payload: any) {
    state.showWhiteBoard = payload;
  },
  setDrawLaser(state: StudentRoomState, payload: any) {
    state.laserPath = payload;
  },
  clearLaserPen(state: StudentRoomState, p: "") {
    state.laserPath = p;
  },
  setAnnotationStatus(s: StudentRoomState, p: { id: string; isPalette: boolean }) {
    const student = p.id === s.student?.id ? s.student : s.students.find(st => st.id === p.id);
    if (student) student.isPalette = p.isPalette;
  },
  disableAnnotationStatus(s: StudentRoomState, p: any) {
    s.students.map(student => (student.isPalette = false));
    if (s.student) s.student.isPalette = false;
  },
  setOnline(state: StudentRoomState) {
    state.isDisconnected = false;
  },
  setOffline(state: StudentRoomState) {
    state.isDisconnected = true;
  },
  setIsJoined(state: StudentRoomState, p: { isJoined: boolean }) {
    state.isJoined = p.isJoined;
  },
  setTeacherDisconnected(state: StudentRoomState, p: boolean) {
    state.teacherIsDisconnected = p;
  },
  setAvatarIndependent(state: StudentRoomState, p: { teacherAvatar: string; studentAvatar: string }) {
    state.avatarTeacher = p.teacherAvatar;
    state.avatarStudentOneToOne = p.studentAvatar;
  },
};

export default mutations;
