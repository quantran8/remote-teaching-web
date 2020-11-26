import { UserModel } from "./user.model";

export interface TeacherModel extends UserModel {
  id: string;
  name: string;
  isInClass: boolean;
  zoomId?: string;
  signalrConnectId?: string;
  isMuteAudio: boolean;
  isMuteVideo: boolean;
}
