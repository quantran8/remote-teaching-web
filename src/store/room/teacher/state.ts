import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { ClassView, StudentState, TeacherState } from "../interface";
import { ClassAction } from "../student/state";

export interface TeacherRoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  students: Array<StudentState>;
  manager?: TeacherRoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
  error: GLError | null;
  globalAudios: string[];
  localAudios: string[];
  cameraLock: boolean;
  microphoneLock: boolean;
  classAction: ClassAction;
  idOne: string;
  speakingUsers: Array<string>;
  isDisconnected: boolean;
  isLowBandWidth: boolean;
  listStudentLowBandWidth: string[];
  currentLesson: number;
  currentUnit: number;
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
  classAction: ClassAction.DEFAULT,
  idOne: "",
  speakingUsers: [],
  isDisconnected: !navigator.onLine,
  isLowBandWidth: false,
  listStudentLowBandWidth: [],
  currentLesson: 0,
  currentUnit: 0,
};

export default state;
