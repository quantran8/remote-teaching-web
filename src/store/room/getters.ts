import { RoomManager } from "@/manager/room.manager";
import { UserModel } from "@/models/user.model";
import { GetterTree } from "vuex";
import { RoomState } from "./state";

const getters: GetterTree<RoomState, any> = {
  students(state: RoomState): Array<UserModel> {
    return state.students;
  },
  roomManager(state: RoomState): RoomManager {
    return state.manager as RoomManager;
  },
};

export default getters;
