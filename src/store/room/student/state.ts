import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel } from "@/models";
import { RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { ClassView, StudentState, TeacherState } from "../interface";

export enum ClassAction {
  DEFAULT = "listen",
  LISTEN = "listen",
  QUESTION = "question",
  QUIET = "quiet",
  SING = "sing",
  SPEAK = "speak",
  INTERACTIVE = "interactive",
}

export const ClassActionFromValue = (val: number): ClassAction => {
  if (val === 0) return ClassAction.DEFAULT;
  if (val === 1) return ClassAction.LISTEN;
  if (val === 2) return ClassAction.QUESTION;
  if (val === 3) return ClassAction.QUIET;
  if (val === 4) return ClassAction.SING;
  if (val === 5) return ClassAction.SPEAK;
  if (val === 6) return ClassAction.INTERACTIVE;
  throw new Error("UnSupported Class Action " + val);
};

export const ClassActionToValue = (classAction: ClassAction): number => {
  let val = 0;
  switch (classAction) {
    case ClassAction.DEFAULT:
      val = 0;
      break;
    case ClassAction.LISTEN:
      val = 1;
      break;
    case ClassAction.QUESTION:
      val = 2;
      break;
    case ClassAction.QUIET:
      val = 3;
      break;
    case ClassAction.SING:
      val = 4;
      break;
    case ClassAction.SPEAK:
      val = 5;
      break;
    case ClassAction.INTERACTIVE:
      val = 6;
      break;
  }
  return val;
};

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
  cameraLock: boolean;
  microphoneLock: boolean;
  classAction: ClassAction;
  idOne: string;
  speakingUsers: Array<string>;
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
  cameraLock: false,
  microphoneLock: false,
  classAction: ClassAction.DEFAULT,
  idOne: "",
  speakingUsers: [],
};

export default state;
