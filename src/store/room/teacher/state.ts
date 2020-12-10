import { TeacherRoomManager } from "@/manager/room/teacher.manager";
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
  manager?: TeacherRoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
  error: GLError | null;
  globalAudios: Array<{
    studentId: string;
    tag: string;
  }>;
  localAudios: Array<{
    studentId: string;
    tag: string;
  }>;
  cameraLock: boolean;
  microphoneLock: boolean;
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
  globalAudios: [],
  localAudios: [],
  cameraLock: false,
  microphoneLock: false,
};

export default state;
