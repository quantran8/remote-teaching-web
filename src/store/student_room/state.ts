import { RoomManager } from "@/manager/room.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { StudentModel } from "@/models";
import { TeacherModel } from "@/models";
import { UserModel } from "@/models/user.model";

export enum StudentInClassStatus {
  /**Student is not join the class yet */
  DEFAULT = 0,
  /**
   * Student send a request to Join the class, it depends on the setting of the class. If student can join class at any time without any restrictions then this value is not in use.
   */
  REQUESTING = 1,
  /**
   * Student is now in the class
   */
  JOINED = 2,
  /**
   * Student is about to leave the class
   */
  LEAVING = 3,
  /**
   * Student has left the class
   */
  LEFT = 4,
}
export enum StreamingStatus {
  WAITING = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  DISCONNECTED = 3,
}

export interface StudentState {
  id: string;
  index: number;
  name: string;
  avatar: string;
  badge: number;
  hasJoinned: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  status: StudentInClassStatus;
}

export interface TeacherState {
  id: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}
export enum ClassView {
  GALLERY = "gallery",
  LESSON_PLAN = "lesson_plan",
  WHITE_BOARD = "white_board",
  GAME = "game",
}

export interface RoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  student?: StudentState;
  students: Array<StudentState>;
  manager?: RoomManager;
  classes: Array<ClassModel>;
  classView: ClassView;
}

const state: RoomState = {
  info: undefined,
  user: undefined,
  teacher: undefined,
  students: [],
  manager: undefined,
  classes: [],
  classView: ClassView.GALLERY,
};

export default state;
