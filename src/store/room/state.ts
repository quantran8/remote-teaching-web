import { UserModel } from "@/models/user.model";

export interface RoomState {
  teacher?: UserModel;
  students: Array<UserModel>;
}

const state: RoomState = {
  teacher: undefined,
  students: [],
};

export default state;
