import { RoomModel, TeacherClassModel } from "@/models";
import { UserModel } from "@/models/user.model";

export interface TeacherState {
  info?: UserModel;
  classes: Array<TeacherClassModel>;
  room?: RoomModel;
}

const state: TeacherState = {
  info: undefined,
  classes: [],
  room: undefined,
};

export default state;
