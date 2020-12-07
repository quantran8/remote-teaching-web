import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { ClassView, StudentState, TeacherState } from "../interface";

export interface StudentRoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  student?: StudentState;
  students: Array<StudentState>;
  manager?: StudentRoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
  error: GLError | null;
  globalAudios: Array<string>;
}

const state: StudentRoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
  classView: ClassView.GALLERY,
  error: null,
  globalAudios: [],
};

export default state;
