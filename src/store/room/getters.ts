import { RoomManager } from "@/manager/room.manager";
import { ClassModel, RoomModel, StudentModel } from "@/models";
import { TeacherModel } from "@/models";
import { GetterTree } from "vuex";
import { RoomState } from "./state";

const getters: GetterTree<RoomState, any> = {
  info(state: RoomState): RoomModel {
    return state.info as RoomModel;
  },
  classes(state: RoomState): Array<ClassModel> {
    return state.classes;
  },
  students(state: RoomState): Array<StudentModel> {
    return state.students;
  },
  teacher(state: RoomState): TeacherModel {
    return state.teacher as TeacherModel;
  },
  roomManager(state: RoomState): RoomManager {
    return state.manager as RoomManager;
  },
};

export default getters;
