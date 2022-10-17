import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel, RoomModel, StudentModel, RoomUsersModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import {
  ClassView,
  ClassViewFromValue,
  InClassStatus,
  DeviceMediaPayload,
  DefaultPayload,
  ClassViewPayload,
  UserMediaPayload,
  StudentBadgePayload,
  UserIdPayload,
} from "../interface";
import { ClassAction, ClassActionFromValue } from "../student/state";
import { TeacherRoomState } from "./state";

type State = TeacherRoomState;

export interface TeacherRoomMutationInterface<S> {
  setCameraLock(s: S, p: DeviceMediaPayload): void;
  setMicrophoneLock(s: S, p: DeviceMediaPayload): void;
  endClass(s: S, p: DefaultPayload): void;
  setClassView(s: S, p: ClassViewPayload): void;
  setError(s: S, p: GLError | null): void;
  setClasses(s: S, p: Array<ClassModel>): void;
  setUser(s: S, p: UserModel): void;
  setRoomInfo(s: S, p: RoomModel): void;
  setStudentAudio(s: S, p: UserMediaPayload): void;
  setStudentVideo(s: S, p: UserMediaPayload): void;
  setStudentPalette(s: S, p: UserMediaPayload): void;
  setStudentBadge(s: S, p: StudentBadgePayload): void;
  setTeacherAudio(s: S, p: UserMediaPayload): void;
  setTeacherVideo(s: S, p: UserMediaPayload): void;
  hideAllStudents(s: S, p: DefaultPayload): void;
  showAllStudents(s: S, p: DefaultPayload): void;
  muteAllStudents(s: S, p: DefaultPayload): void;
  unmuteAllStudents(s: S, p: DefaultPayload): void;
  disableAllStudents(s: S, p: DefaultPayload): void;
  enableAllStudents(s: S, p: DefaultPayload): void;
  studentJoinned(s: S, p: UserIdPayload): void;
  studentLeftClass(s: S, p: UserIdPayload): void;
  studentLeaving(s: S, p: UserIdPayload): void;
  studentRaisingHand(s: S, p: { raisingHand: boolean }): void;
  setGlobalAudios(s: S, p: Array<string>): void;
  addGlobalAudio(s: S, p: UserIdPayload): void;
  clearGlobalAudio(s: S, p: DefaultPayload): void;
  addStudentAudio(s: S, p: UserIdPayload): void;
  setLocalAudios(s: S, p: Array<string>): void;
  clearStudentAudio(s: S, p: DefaultPayload): void;
  setWhiteboard(s: S, p: boolean): void;
  setIsTeacherUseOnly(s: S, p: boolean): void;
}

export interface TeacherRoomMutation<S> extends MutationTree<S>, TeacherRoomMutationInterface<S> {}

const mutations: TeacherRoomMutation<State> = {
  setCameraLock(s: State, p: DeviceMediaPayload): void {
    s.cameraLock = p.enable;
  },
  setMicrophoneLock(s: State, p: DeviceMediaPayload): void {
    s.microphoneLock = p.enable;
  },
  endClass(s: State, p: DefaultPayload): void {
    s.manager?.close(true);
    s.info = undefined;
    s.user = undefined;
    s.teacher = undefined;
    s.students = [];
    s.manager = undefined;
    s.classes = [];
    s.classView = ClassView.GALLERY;
    s.idOne = "";
  },
  setClassView(s: State, p: ClassViewPayload): void {
    s.classView = p.classView;
  },
  setError(s: State, p: GLError | null): void {
    s.error = p;
  },
  setClasses(s: State, p: ClassModel[]): void {
    s.classes = p;
  },
  setUser(s: State, p: UserModel): void {
    s.user = p;
  },
  setRoomInfo(s: State, p: RoomModel): void {
    s.info = p;
    s.idOne = p.studentOneToOne ? p.studentOneToOne : "";
    s.currentLesson = p.classInfo?.lesson;
    s.currentUnit = p.classInfo?.unit;
    s.teacher = {
      id: p.teacher.id,
      name: p.teacher.name,
      avatar: "",
      audioEnabled: !p.teacher.isMuteAudio,
      videoEnabled: !p.teacher.isMuteVideo,
      status: p.teacher.connectionStatus,
    };
	s.isTeacherVideoMirror = p.isTeacherVideoMirror;
	s.isStudentVideoMirror = p.isStudentVideoMirror;

    s.classView = ClassViewFromValue(p.teachingMode);
    s.students = p.students.map((st, index) => {
      return {
        id: st.id,
        name: st.name,
        englishName: st.englishName,
        avatar: "",
        audioEnabled: !st.isMuteAudio,
        videoEnabled: !st.isMuteVideo,
        badge: st.badge,
        status: st.connectionStatus,
        index: index,
        raisingHand: st.isRaisingHand,
        isPalette: st.isPalette,
      };
    });
    s.localAudios = s.students.filter((ele) => p.studentsAudio.indexOf(ele.id) !== -1).map((el) => el.id);
    const role = p.streamInfo?.userId === p.teacher.id ? "host" : "audience";
    if (!s.manager) {
      s.manager = new TeacherRoomManager({
        agora: {
          appId: p.streamInfo.appId,
          webConfig: { mode: "rtc", codec: "vp8", role: role },
          user: {
            channel: p.streamInfo.chanelId,
            username: p.streamInfo.userId,
            token: p.streamInfo.token,
            role: role,
          },
        },
        // zoom: {
        //   user: {
        //     channel: p.streamInfo.chanelId,
        //     username: p.streamInfo.userId,
        //     token: p.streamInfo.token,
        //     role: role,
        //   },
        // },
      });
    }
    s.classAction = ClassActionFromValue(p.lessonPlan.lessonAction);
  },
  setStudentAudio(s: State, p: UserMediaPayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.audioEnabled = p.enable;
  },
  setStudentVideo(s: State, p: UserMediaPayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.videoEnabled = p.enable;
  },
  setStudentPalette(s: State, p: UserMediaPayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.isPalette = p.enable;
  },
  setStudentBadge(s: State, p: StudentBadgePayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.badge = p.badge;
  },
  setTeacherAudio(s: State, p: UserMediaPayload): void {
    if (s.teacher?.id === p.id) s.teacher.audioEnabled = p.enable;
  },
  setTeacherVideo(s: State, p: UserMediaPayload): void {
    if (s.teacher?.id === p.id) s.teacher.videoEnabled = p.enable;
  },
  hideAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.videoEnabled = false));
  },
  showAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.videoEnabled = true));
  },
  muteAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.audioEnabled = false));
  },
  unmuteAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.audioEnabled = true));
  },
  disableAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = false));
  },
  enableAllStudents(s: State, _): void {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = true));
  },
  studentJoinned(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) student.status = InClassStatus.JOINED;
  },
  updateMediaStatus(s: State, p: StudentModel): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      student.videoEnabled = !p.isMuteVideo;
      student.audioEnabled = !p.isMuteAudio;
    }
  },
  updateRaisingHand(state: State, payload: { id: string; isRaisingHand: boolean }): void {
    const student = state.students.find((student) => student.id === payload.id);
    if (student) {
      student.raisingHand = payload.isRaisingHand;
    }
  },
  updateIsPalette(state: State, payload: { id: string; isPalette: boolean }) {
    const student = state.students.find((student) => student.id === payload.id);
    if (student) {
      student.isPalette = payload.isPalette;
    }
  },
  studentLeftClass(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      student.raisingHand = false;
      student.isPalette = false;
      student.status = InClassStatus.LEFT;
    }
  },
  studentDisconnectClass(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      student.raisingHand = false;
      student.isPalette = false;
      student.status = InClassStatus.DISCONNECTED;
    }
  },
  studentLeaving(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      student.raisingHand = false;
      student.isPalette = false;
      student.status = InClassStatus.LEAVING;
    }
  },
  studentRaisingHand(s: State, p: { id: string; raisingHand: boolean }): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) student.raisingHand = p.raisingHand;
  },
  setGlobalAudios(s: State, p: string[]): void {
    s.globalAudios = s.students.filter((st) => p.indexOf(st.id) !== -1).map((st) => st.id);
  },
  addGlobalAudio(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      if (s.globalAudios.indexOf(student.id) !== -1) {
        s.globalAudios.push(student.id);
      }
    }
  },
  clearGlobalAudio(s: State, p_: DefaultPayload): void {
    s.globalAudios = [];
  },
  addStudentAudio(s: State, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      if (s.localAudios.indexOf(student.id) !== -1) {
        s.localAudios.push(student.id);
      }
    }
  },
  setLocalAudios(s: State, p: string[]): void {
    s.localAudios = s.students.filter((st) => p.indexOf(st.id) !== -1).map((s) => s.id);
  },
  clearStudentAudio(s: State, _: DefaultPayload): void {
    s.localAudios = [];
  },
  setClassAction(state: State, payload: { action: ClassAction }) {
    state.classAction = payload.action;
  },
  setStudentOneId(s: State, p: { id: string }) {
    s.idOne = p.id;
  },
  clearStudentOneId(s: State, p: { id: string }) {
    s.idOne = p.id;
  },
  setSpeakingUsers(s: State, p: { userIds: Array<string> }) {
    s.speakingUsers = p.userIds;
  },
  setAnnotationStatus(s: TeacherRoomState, p: { id: string; isPalette: boolean }) {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.isPalette = p.isPalette;
  },
  disableAnnotationStatus(s: TeacherRoomState, p: any) {
    s.students.filter((st) => st.status === InClassStatus.JOINED).forEach((student) => (student.isPalette = !p));
  },
  setOnline(state: TeacherRoomState) {
    state.isDisconnected = false;
  },
  setOffline(state: TeacherRoomState) {
    state.isDisconnected = true;
  },
  setTeacherLowBandWidth(state: TeacherRoomState, p) {
    state.isLowBandWidth = p;
  },
  setListStudentLowBandWidth(state: TeacherRoomState, p) {
    state.listStudentLowBandWidth = p;
  },
  setWhiteboard(state: TeacherRoomState, p) {
    state.isShowWhiteboard = p;
  },
  setAvatarAllStudent(state: TeacherRoomState, p: { id: string; avatar: string }[]) {
    state.students.forEach((student) => {
      const avatar = p.find((studentAvatar: any) => studentAvatar.id == student.id)?.avatar;
      student.avatar = avatar ? avatar : "";
    });
  },
  setAvatarTeacher(state: TeacherRoomState, p: string) {
    if (state.teacher) state.teacher.avatar = p;
  },
  setRoomUsersInfo(s: State, p: RoomUsersModel) {
    s.teacher = {
      id: p.teacher.id,
      name: p.teacher.name,
      avatar: "",
      audioEnabled: !p.teacher.isMuteAudio,
      videoEnabled: !p.teacher.isMuteVideo,
      status: p.teacher.connectionStatus,
    };
    s.students = p.students.map((st, index) => {
      return {
        id: st.id,
        name: st.name,
        englishName: st.englishName,
        avatar: "",
        audioEnabled: !st.isMuteAudio,
        videoEnabled: !st.isMuteVideo,
        badge: st.badge,
        status: st.connectionStatus,
        index: index,
        raisingHand: st.isRaisingHand,
        isPalette: st.isPalette,
      };
    });
  },
  setIsTeacherUseOnly(state: TeacherRoomState, p) {
    state.isTeacherUseOnly = p;
  },
};

export default mutations;
