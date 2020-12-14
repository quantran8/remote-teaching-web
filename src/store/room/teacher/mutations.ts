import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { Commit, Mutation, MutationTree } from "vuex";
import { ClassView, ClassViewFromValue, InClassStatus } from "../interface";
import {
  DeviceMediaPayload,
  DefaultPayload,
  ClassViewPayload,
  UserMediaPayload,
  StudentBadgePayload,
  UserIdPayload,
} from "./payload";
import { TeacherRoomState } from "./state";
export interface ITeacherRoomMutation<S> extends MutationTree<S> {
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
  setStudentBadge(s: S, p: StudentBadgePayload): void;
  setTeacherAudio(s: S, p: UserMediaPayload): void;
  setTeacherVideo(s: S, p: UserMediaPayload): void;
  hideAllStudents(s: S): void;
  showAllStudents(s: S): void;
  muteAllStudents(s: S): void;
  unmuteAllStudents(s: S): void;
  studentJoinned(s: S, p: UserIdPayload): void;
  studentLeftClass(s: S, p: UserIdPayload): void;
  studentLeaving(s: S, p: UserIdPayload): void;
  setGlobalAudios(s: S, p: Array<string>): void;
  addGlobalAudio(s: S, p: UserIdPayload): void;
  clearGlobalAudio(s: S, p: DefaultPayload): void;
  addStudentAudio(s: S, p: UserIdPayload): void;
  setLocalAudios(s: S, p: Array<string>): void;
  clearStudentAudio(s: S, p: DefaultPayload): void;
}

export class TeacherRoomMutation
  implements ITeacherRoomMutation<TeacherRoomState> {
  [key: string]: Mutation<TeacherRoomState>;
  setCameraLock(s: TeacherRoomState, p: DeviceMediaPayload): void {
    s.cameraLock = p.enable;
  }
  setMicrophoneLock(s: TeacherRoomState, p: DeviceMediaPayload): void {
    s.microphoneLock = p.enable;
  }
  endClass(s: TeacherRoomState, p: DefaultPayload): void {
    s.manager?.close();
    s.info = undefined;
    s.user = undefined;
    s.teacher = undefined;
    s.students = [];
    s.manager = undefined;
    s.classes = [];
    s.classView = ClassView.GALLERY;
  }
  setClassView(s: TeacherRoomState, p: ClassViewPayload): void {
    s.classView = p.classView;
  }
  setError(s: TeacherRoomState, p: GLError | null): void {
    s.error = p;
  }
  setClasses(s: TeacherRoomState, p: ClassModel[]): void {
    s.classes = p;
  }
  setUser(s: TeacherRoomState, p: UserModel): void {
    s.user = p;
  }
  setRoomInfo(s: TeacherRoomState, p: RoomModel): void {
    s.teacher = {
      id: p.teacher.id,
      name: p.teacher.name,
      avatar: "",
      audioEnabled: !p.teacher.isMuteAudio,
      videoEnabled: !p.teacher.isMuteVideo,
      status: p.teacher.connectionStatus,
    };
    s.classView = ClassViewFromValue(p.focusTab);
    s.students = p.students.map((st, index) => {
      return {
        id: st.id,
        name: st.name,
        avatar: "",
        audioEnabled: !st.isMuteAudio,
        videoEnabled: !st.isMuteVideo,
        badge: st.badge,
        status: st.connectionStatus,
        index: index,
      };
    });
    s.globalAudios = s.students
      .filter((ele) => p.globalStudentsAudio.indexOf(ele.id) !== -1)
      .map((el) => {
        return { studentId: el.id, tag: `${el.index + 1}` };
      });
    s.localAudios = s.students
      .filter((ele) => p.studentsAudio.indexOf(ele.id) !== -1)
      .map((el) => {
        return { studentId: el.id, tag: `${el.index + 1}` };
      });
    s.info = p;
    const role = p.streamInfo.userId === p.teacher.id ? "host" : "audience";
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
      });
    }
  }
  setStudentAudio(s: TeacherRoomState, p: UserMediaPayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.audioEnabled = p.enable;
  }
  setStudentVideo(s: TeacherRoomState, p: UserMediaPayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.videoEnabled = p.enable;
  }
  setStudentBadge(s: TeacherRoomState, p: StudentBadgePayload): void {
    const student = s.students.find((st) => st.id === p.id);
    if (student) student.badge = p.badge;
  }
  setTeacherAudio(s: TeacherRoomState, p: UserMediaPayload): void {
    if (s.teacher?.id === p.id) s.teacher.audioEnabled = p.enable;
  }
  setTeacherVideo(s: TeacherRoomState, p: UserMediaPayload): void {
    if (s.teacher?.id === p.id) s.teacher.videoEnabled = p.enable;
  }
  hideAllStudents(s: TeacherRoomState): void {
    s.students
      .filter((st) => st.status === InClassStatus.JOINED)
      .forEach((student) => (student.videoEnabled = false));
  }
  showAllStudents(s: TeacherRoomState): void {
    s.students
      .filter((st) => st.status === InClassStatus.JOINED)
      .forEach((student) => (student.videoEnabled = true));
  }
  muteAllStudents(s: TeacherRoomState): void {
    s.students
      .filter((st) => st.status === InClassStatus.JOINED)
      .forEach((student) => (student.audioEnabled = false));
  }
  unmuteAllStudents(s: TeacherRoomState): void {
    s.students
      .filter((st) => st.status === InClassStatus.JOINED)
      .forEach((student) => (student.audioEnabled = true));
  }
  studentJoinned(s: TeacherRoomState, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) student.status = InClassStatus.JOINED;
  }
  studentLeftClass(s: TeacherRoomState, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) student.status = InClassStatus.LEFT;
  }
  studentLeaving(s: TeacherRoomState, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) student.status = InClassStatus.LEAVING;
  }
  setGlobalAudios(s: TeacherRoomState, p: string[]): void {
    s.globalAudios = s.students
      .filter((st) => p.indexOf(st.id) !== -1)
      .map((st) => {
        return {
          studentId: st.id,
          tag: `${st.index + 1}`,
        };
      });
  }
  addGlobalAudio(s: TeacherRoomState, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      if (!s.globalAudios.find((ele) => ele.studentId === student?.id)) {
        s.globalAudios.push({
          studentId: student.id,
          tag: `${student.index + 1}`,
        });
      }
    }
  }
  clearGlobalAudio(s: TeacherRoomState, p: DefaultPayload): void {
    s.globalAudios = [];
  }
  addStudentAudio(s: TeacherRoomState, p: UserIdPayload): void {
    const student = s.students.find((student) => student.id === p.id);
    if (student) {
      if (!s.localAudios.find((ele) => ele.studentId === student?.id)) {
        s.localAudios.push({
          studentId: student.id,
          tag: `${student.index + 1}`,
        });
      }
    }
  }
  setLocalAudios(s: TeacherRoomState, p: string[]): void {
    s.localAudios = s.students
      .filter((st) => p.indexOf(st.id) !== -1)
      .map((s) => {
        return {
          studentId: s.id,
          tag: `${s.index + 1}`,
        };
      });
  }
  clearStudentAudio(s: TeacherRoomState, p: DefaultPayload): void {
    s.localAudios = [];
  }
}

export default new TeacherRoomMutation();

// const mutations: TeacherRoomMutation<TeacherRoomState> = {
//   setCameraLock(
//     state: TeacherRoomState,
//     payload: {
//       enable: boolean;
//     }
//   ) {
//     state.cameraLock = payload.enable;
//   },
//   setMicrophoneLock(
//     state: TeacherRoomState,
//     payload: {
//       enable: boolean;
//     }
//   ) {
//     state.microphoneLock = payload.enable;
//   },
//   endClass(state: TeacherRoomState, payload: any) {
//     state.manager?.close();
//     state.info = undefined;
//     state.user = undefined;
//     state.teacher = undefined;
//     state.students = [];
//     state.manager = undefined;
//     state.classes = [];
//     state.classView = ClassView.GALLERY;
//   },
//   setClassView(state: TeacherRoomState, payload: { classView: ClassView }) {
//     state.classView = payload.classView;
//   },
//   setError(state: TeacherRoomState, payload: GLError | null) {
//     state.error = payload;
//   },
//   setClasses(state: TeacherRoomState, payload: Array<ClassModel>) {
//     state.classes = payload;
//   },
//   setUser(state: TeacherRoomState, payload: UserModel) {
//     state.user = payload;
//   },

//   setRoomInfo(state: TeacherRoomState, room: RoomModel) {
//     state.teacher = {
//       id: room.teacher.id,
//       name: room.teacher.name,
//       avatar: "",
//       audioEnabled: !room.teacher.isMuteAudio,
//       videoEnabled: !room.teacher.isMuteVideo,
//       status: room.teacher.connectionStatus,
//     };
//     state.classView = ClassViewFromValue(room.focusTab);
//     state.students = room.students.map((st, index) => {
//       return {
//         id: st.id,
//         name: st.name,
//         avatar: "",
//         audioEnabled: !st.isMuteAudio,
//         videoEnabled: !st.isMuteVideo,
//         badge: st.badge,
//         status: st.connectionStatus,
//         index: index,
//       };
//     });
//     state.globalAudios = state.students
//       .filter((ele) => room.globalStudentsAudio.indexOf(ele.id) !== -1)
//       .map((el) => {
//         return { studentId: el.id, tag: `${el.index + 1}` };
//       });
//     state.localAudios = state.students
//       .filter((ele) => room.studentsAudio.indexOf(ele.id) !== -1)
//       .map((el) => {
//         return { studentId: el.id, tag: `${el.index + 1}` };
//       });
//     state.info = room;
//     const role =
//       room.streamInfo.userId === room.teacher.id ? "host" : "audience";
//     if (!state.manager)
//       state.manager = new TeacherRoomManager({
//         agora: {
//           appId: room.streamInfo.appId,
//           webConfig: { mode: "rtc", codec: "vp8", role: role },
//           user: {
//             channel: room.streamInfo.chanelId,
//             username: room.streamInfo.userId,
//             token: room.streamInfo.token,
//             role,
//           },
//         },
//       });
//   },

//   setStudentAudio(
//     state: TeacherRoomState,
//     payload: { studentId: string; audioEnabled: boolean }
//   ) {
//     const student = state.students.find((st) => st.id === payload.studentId);
//     if (student) student.audioEnabled = payload.audioEnabled;
//   },
//   setStudentVideo(
//     state: TeacherRoomState,
//     payload: { studentId: string; videoEnabled: boolean }
//   ) {
//     const student = state.students.find((st) => st.id === payload.studentId);
//     if (student) student.videoEnabled = payload.videoEnabled;
//   },
//   setStudentBadge(
//     state: TeacherRoomState,
//     payload: { studentId: string; badge: number }
//   ) {
//     const student = state.students.find((st) => st.id === payload.studentId);
//     if (student) student.badge = payload.badge;
//   },
//   setTeacherAudio(
//     state: TeacherRoomState,
//     payload: { teacherId: string; audioEnabled: boolean }
//   ) {
//     if (state.teacher?.id === payload.teacherId)
//       state.teacher.audioEnabled = payload.audioEnabled;
//   },
//   setTeacherVideo(
//     state: TeacherRoomState,
//     payload: { teacherId: string; videoEnabled: boolean }
//   ) {
//     if (state.teacher?.id === payload.teacherId)
//       state.teacher.videoEnabled = payload.videoEnabled;
//   },

//   hideAllStudents(state: TeacherRoomState) {
//     state.students
//       .filter((s) => s.status === InClassStatus.JOINED)
//       .forEach((student) => (student.videoEnabled = false));
//   },
//   showAllStudents(state: TeacherRoomState) {
//     state.students
//       .filter((s) => s.status === InClassStatus.JOINED)
//       .forEach((student) => (student.videoEnabled = true));
//   },
//   muteAllStudents(state: TeacherRoomState) {
//     state.students
//       .filter((s) => s.status === InClassStatus.JOINED)
//       .forEach((student) => (student.audioEnabled = false));
//   },
//   unmuteAllStudents(state: TeacherRoomState) {
//     state.students
//       .filter((s) => s.status === InClassStatus.JOINED)
//       .forEach((student) => (student.audioEnabled = true));
//   },
//   studentJoinned(state: TeacherRoomState, payload: { studentId: string }) {
//     const student = state.students.find(
//       (student) => student.id === payload.studentId
//     );
//     if (student) student.status = InClassStatus.JOINED;
//   },
//   studentLeftClass(state: TeacherRoomState, payload: { studentId: string }) {
//     const student = state.students.find(
//       (student) => student.id === payload.studentId
//     );
//     if (student) student.status = InClassStatus.LEFT;
//   },
//   studentLeaving(state: TeacherRoomState, payload: { studentId: string }) {
//     const student = state.students.find(
//       (student) => student.id === payload.studentId
//     );
//     if (student) student.status = InClassStatus.LEAVING;
//   },

//   setGlobalAudios(state: TeacherRoomState, payload: Array<string>) {
//     state.globalAudios = state.students
//       .filter((st) => payload.indexOf(st.id) !== -1)
//       .map((s) => {
//         return {
//           studentId: s.id,
//           tag: `${s.index + 1}`,
//         };
//       });
//   },
//   addGlobalAudio(state: TeacherRoomState, payload: { studentId: string }) {
//     const student = state.students.find(
//       (student) => student.id === payload.studentId
//     );
//     if (student) {
//       if (!state.globalAudios.find((ele) => ele.studentId === student?.id)) {
//         state.globalAudios.push({
//           studentId: student.id,
//           tag: `${student.index + 1}`,
//         });
//       }
//     }
//   },
//   clearGlobalAudio(state: TeacherRoomState, payload: any) {
//     state.globalAudios = [];
//   },
//   addStudentAudio(state: TeacherRoomState, payload: { studentId: string }) {
//     const student = state.students.find(
//       (student) => student.id === payload.studentId
//     );
//     if (student) {
//       if (!state.localAudios.find((ele) => ele.studentId === student?.id)) {
//         state.localAudios.push({
//           studentId: student.id,
//           tag: `${student.index + 1}`,
//         });
//       }
//     }
//   },
//   setLocalAudios(state: TeacherRoomState, payload: Array<string>) {
//     state.localAudios = state.students
//       .filter((st) => payload.indexOf(st.id) !== -1)
//       .map((s) => {
//         return {
//           studentId: s.id,
//           tag: `${s.index + 1}`,
//         };
//       });
//   },
//   clearStudentAudio(state: TeacherRoomState, payload: any) {
//     state.localAudios = [];
//   },
// };

// export default mutations;
