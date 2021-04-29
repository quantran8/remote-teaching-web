import { UserModel } from "./user.model";

export interface StudentModel extends UserModel {
  id: string;
  name: string;
  englishName: string;
  updateTime: any;
  subscriptionType: number;
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
}
