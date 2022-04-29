import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel, RoomModel, StudentModel, RoomUsersModel } from "@/models";
import { GLApiStatus, GLError } from "@/models/error.model";
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
    state.teacherIsDisconnected = false;
  },
  setError(state: StudentRoomState, payload: GLError | null) {
    state.error = payload;
  },
  setApiStatus(state: StudentRoomState, payload: GLApiStatus | null) {
    state.apiStatus = payload;
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
      disconnectTime: room.teacher.disconnectTime ? Date.now() - room.teacher.disconnectTime : null,
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
      }
    }
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
        zoom: {
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
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) student.audioEnabled = payload.enable;
  },
  setStudentStatus(state: StudentRoomState, payload: { id: string; status: InClassStatus }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) student.status = payload.status;
  },
  updateMediaStatus(s: StudentRoomState, p: StudentModel): void {
    if (s.student?.id === p.id) {
      s.student.videoEnabled = !p.isMuteVideo;
      s.student.audioEnabled = !p.isMuteAudio;
    }
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      student.videoEnabled = !p.isMuteVideo;
      student.audioEnabled = !p.isMuteAudio;
    }
  },
  updateRaisingHand(state: StudentRoomState, payload: { id: string; isRaisingHand: boolean }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) {
      student.raisingHand = payload.isRaisingHand;
    }
  },
  updateIsPalette(state: StudentRoomState, payload: { id: string; isPalette: boolean }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) {
      student.isPalette = payload.isPalette;
    }
  },
  clearCircleStatus(state: StudentRoomState, payload: { id: string }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) {
      student.raisingHand = false;
      student.isPalette = false;
    }
  },
  setStudentVideo(state: StudentRoomState, payload: { id: string; enable: boolean }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
    if (student) student.videoEnabled = payload.enable;
  },
  setStudentBadge(state: StudentRoomState, payload: { id: string; badge: number }) {
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
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
  disableAllStudents(state: StudentRoomState) {
    state.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = false));
  },
  enableAllStudents(state: StudentRoomState) {
    state.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = true));
  },
  setAnnotationStatus(s: StudentRoomState, p: { id: string; isPalette: boolean }) {
    const student = p.id === s.student?.id ? s.student : s.students.find((st) => st.id === p.id);
    if (student) student.isPalette = p.isPalette;
  },
  disableAnnotationStatus(state: StudentRoomState, p: any) {
    state.student ? (state.student.isPalette = !p) : null;
    state.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = !p));
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
    const student = payload.id === state.student?.id ? state.student : state.students.find((st) => st.id === payload.id);
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
    if (!p && state.teacher) {
      state.teacher.disconnectTime = null;
    }
  },
  setAvatarTeacher(state: StudentRoomState, p: string) {
    if (state.teacher) state.teacher.avatar = p;
  },
  setAvatarStudentOneToOne(state: StudentRoomState, p: { id: string; avatar: string }[]) {
    state.avatarStudentOneToOne = p[0]?.avatar;
  },
  setAvatarCurrentStudent(state: StudentRoomState, p: { id: string; avatar: string }[]) {
    if (state.student) state.student.avatar = p[0] ? p[0].avatar : "";
  },
  setAvatarAllStudent(state: StudentRoomState, p: { id: string; avatar: string }[]) {
    state.students.forEach((student) => {
      const avatar = p.find((studentAvatar: any) => studentAvatar.id == student.id)?.avatar;
      student.avatar = avatar ? avatar : "";
    });
  },
  toggleVideosFeed(state: StudentRoomState) {
    state.videosFeedVisible = !state.videosFeedVisible;
  },
  setRoomUsersInfo(state: StudentRoomState, room: RoomUsersModel) {
    state.teacher = {
      id: room.teacher.id,
      name: room.teacher.name,
      avatar: "",
      audioEnabled: !room.teacher.isMuteAudio,
      videoEnabled: !room.teacher.isMuteVideo,
      status: room.teacher.connectionStatus,
      disconnectTime: room.teacher.disconnectTime ? Date.now() - room.teacher.disconnectTime : null,
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
  },
};

export default mutations;
