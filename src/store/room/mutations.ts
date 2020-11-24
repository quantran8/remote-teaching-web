import { RoomManager, RoomOptions } from "@/manager/room.manager";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { RoomState } from "./state";

const mutations: MutationTree<RoomState> = {
  initRoom(state: RoomState, payload: RoomOptions) {
    if (state.manager) return;
    state.manager = new RoomManager(payload);
  },
  setStudents(state: RoomState, payload: Array<UserModel>) {
    state.students = payload;
  },
  setInfo(state: RoomState, payload: any) {
    console.log("SetRoomInfo", state, payload);
  },
};

export default mutations;
