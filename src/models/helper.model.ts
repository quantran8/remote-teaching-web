import { HelperInClassStatus } from "@/store/room/interface";
import { UserModel } from "./user.model";

export interface HelperModel extends UserModel {
  signalrConnectId: string | null;
  isMuteAudio: boolean;
  isMuteVideo: boolean;
  browserFingerPrinting: string;
  connectionStatus: HelperInClassStatus;
  isVideoShownByTeacher: boolean;
}
