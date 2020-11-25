import { RoomManager } from "@/manager/room.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { StudentModel } from "@/models";
import { TeacherModel } from "@/models";
import { UserModel } from "@/models/user.model";

export interface RoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherModel;
  students: Array<StudentModel>;
  manager?: RoomManager;
  classes: Array<ClassModel>;
}

const state: RoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
};

export default state;
