import { RoomManager } from "@/manager/room.manager";
import { UserModel } from "@/models/user.model";

export interface RoomState {
  teacher?: UserModel;
  students: Array<UserModel>;
  manager?: RoomManager;
}

const state: RoomState = {
  teacher: undefined,
  students: [],
  manager: undefined,
};

export default state;
