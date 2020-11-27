import { RoomManager } from "@/manager/room/base.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { UserModel } from "@/models/user.model";
import { ClassView, StudentState, TeacherState } from '../interface';

export interface StudentRoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  student?: StudentState;
  students: Array<StudentState>;
  manager?: RoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
}

const state: StudentRoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
  classView: ClassView.GALLERY,
};

export default state;
