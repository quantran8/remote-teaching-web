import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { ClassModel, RoomModel } from "@/models";
import { GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { BlobTagItem } from "@/services/storage/interface";
import { ClassView, HelperState, StudentCaptureStatus, StudentState, TeacherState } from "../interface";
import { ClassAction } from "../student/state";

const DEFAULT_LESSON = 0;
const DEFAULT_UNIT = 0;

export interface TeacherRoomState {
  info?: RoomModel;
  user?: UserModel;
  teacher?: TeacherState;
  students: Array<StudentState>;
  helper?: HelperState;
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
  isShowWhiteboard: boolean;
  isTeacherVideoMirror: boolean;
  isStudentVideoMirror: boolean;
  isTeacherUseOnly: boolean;
  studentsImageCaptured: Array<BlobTagItem>;
  mediaState: boolean;
  currentTimeMedia: number;
  isCaptureAll: boolean;
  studentCaptureAll: Array<StudentCaptureStatus>;
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
  currentLesson: DEFAULT_LESSON,
  currentUnit: DEFAULT_LESSON,
  isShowWhiteboard: false,
  isTeacherVideoMirror: true,
  isStudentVideoMirror: true,
  isTeacherUseOnly: false,
  studentsImageCaptured: [],
  isCaptureAll: false,
  studentCaptureAll: [],
  mediaState: false,
  currentTimeMedia: 0,
};

export default state;
