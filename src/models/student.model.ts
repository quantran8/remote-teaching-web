import { UserModel } from "./user.model";

export interface StudentModel extends UserModel {
  id: string;
  name: string;
  englishName: string;
  updateTime: any;
  subscriptionType: number;
  unit: string;
  lesson: string;
  streamId?: string;
  signalrConnectId?: string;
  signature: string;
  isLeave: boolean;
  isMuteAudio: boolean;
  isMuteVideo: boolean;
  badge: number;
  isRaisingHand: boolean;
  connectionStatus: number;
  isPalette: boolean;
  imageCapturedCount: number;
}

export interface StudentNextSessionModel {
  classInfo: {
    classId: string;
    className: string;
    groupId: string;
    groupName: string;
  };
  nextTime: string;
  sessionId: string;
  studentId: string;
}

export interface StudentGroupModel {
  studentId: string;
  studentName: string;
  nativeName: string;
  isActivated: boolean;
}
