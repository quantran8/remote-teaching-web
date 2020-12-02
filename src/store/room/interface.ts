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
export const ValueOfClassView = (classView: ClassView) => {
  switch (classView) {
    case ClassView.GALLERY:
      return 1;
    case ClassView.LESSON_PLAN:
      return 2;
    case ClassView.WHITE_BOARD:
      return 3;
    case ClassView.GAME:
      return 4;

    default:
      return 1;
  }
};

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
