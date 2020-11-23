import { ClassModel } from "@/models/class.model";
import { UserModel } from "@/models/user.model";
import { MutationTree } from "vuex";
import { RoomState } from "./state";

const mutations: MutationTree<RoomState> = {
  setStudents(state: RoomState, payload: Array<UserModel>) {
    state.students = payload;
  },
  setInfo(state: RoomState, payload: any) {
    console.log("SetRoomInfo", state, payload);
  },
};

export default mutations;
