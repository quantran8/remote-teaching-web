import { RoomManager, RoomOptions } from "@/manager/room.manager";
import { ClassModel, RoomModel } from "@/models";
import { StudentModel } from "@/models";
import { TeacherModel } from "@/models";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { RoomState } from "./state";

const mutations: MutationTree<RoomState> = {
  initRoom(state: RoomState, payload: RoomOptions) {
    if (state.manager) return;
    state.manager = new RoomManager(payload);
  },
  setStudents(state: RoomState, payload: Array<StudentModel>) {
    state.students = payload;
  },
  setClasses(state: RoomState, payload: Array<ClassModel>) {
    state.classes = payload;
  },
  setTeacher(state: RoomState, payload: TeacherModel) {
    state.teacher = payload;
  },
  setCurrentUser(state: RoomState, payload: UserModel) {
    state.user = payload;
  },
  setRoomInfo(state: RoomState, payload: RoomModel) {
    state.teacher = payload.teacher;
    state.students = payload.students;
    state.info = payload;
  },
};

export default mutations;
