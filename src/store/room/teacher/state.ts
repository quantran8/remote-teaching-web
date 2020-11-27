import { RoomManager } from "@/manager/room/base.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
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
  error: GLError | null;
}

const state: TeacherRoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
  classView: ClassView.GALLERY,
  error: null,
};

export default state;
