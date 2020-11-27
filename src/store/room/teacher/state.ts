import { RoomManager } from "@/manager/room/base.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { UserModel } from "@/models/user.model";
import { ClassView, StudentState, TeacherState } from "../interface";

export interface TeacherRoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  students: Array<StudentState>;
  manager?: RoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
}

const state: TeacherRoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
  classView: ClassView.GALLERY,
};

export default state;
