export interface StudentState {
  id: string;
  index: number;
  name: string;
  englishName: string;
  avatar?: string;
  badge: number;
  audioEnabled: boolean;
  videoEnabled: boolean;
  status: InClassStatus;
  raisingHand: boolean;
  isPalette: boolean;
  imageCapturedCount: number;
}

export interface LessonInfo {
  unit: string;
  lesson: string;
}
export interface TeacherState {
  id: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  status: InClassStatus;
  disconnectTime?: number | null;
}
export enum ClassView {
  GALLERY = "gallery",
  LESSON_PLAN = "lesson_plan",
  WHITE_BOARD = "white_board",
  GAME = "game",
}
export const ValueOfClassView = (classView: ClassView) => {
  switch (classView) {
    case ClassView.GALLERY:
      return 1;
    case ClassView.LESSON_PLAN:
      return 2;
    case ClassView.GAME:
      return 3;
    case ClassView.WHITE_BOARD:
      return 4;

    default:
      return 1;
  }
};
export const ClassViewFromValue = (value: number) => {
  if (value === 1) return ClassView.GALLERY;
  if (value === 2) return ClassView.LESSON_PLAN;
  if (value === 3) return ClassView.GAME;
  if (value === 4) return ClassView.WHITE_BOARD;
  throw new Error("Unsupported value " + value);
};

export enum InClassStatus {
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
  /**
   * Student has left the class
   */
  DISCONNECTED = 5,
}
export enum StreamingStatus {
  WAITING = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  DISCONNECTED = 3,
}

export interface UserIdPayload {
  id: string;
}
export interface UserMediaPayload {
  id: string;
  enable: boolean;
}
export interface DeviceMediaPayload {
  enable: boolean;
}

export interface StudentBadgePayload {
  id: string;
  badge: number;
}

export interface ClassViewPayload {
  classView: ClassView;
}

export interface WhiteboardPayload {
  isShowWhiteBoard: boolean;
}

export type DefaultPayload = any;

export interface InitClassRoomPayload {
  classId: string;
  userId: string;
  userName: string;
  role: string;
  browserFingerPrinting: string;
}

export interface NetworkQualityPayload {
  uplinkNetworkQuality: number;
  downlinkNetworkQuality: number;
}

export interface StudentCaptureStatus {
  studentId: string;
  fileName: string;
  imageCapturedCount: number;
  isUploaded: boolean;
  error: string;
}
