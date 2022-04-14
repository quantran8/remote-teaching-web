import { ClassRoomStatus, MediaStatus, SignalRStatus } from "@/models";
import { CAMERA_ID_KEY } from "@/utils/constant";

export type LayoutType = "" | "full" | "main";
export enum AppView {
  Authorized = 1,
  UnAuthorized = 2,
  NotFound = 3,
  Blank = 4,
}

export enum UserRole {
  UnConfirm = 0,
  Teacher = 1,
  Student = 2,
}

export interface AppState {
  layout: LayoutType;
  appView: AppView;
  toast: ToastData;
  contentSignature: string;
  isMuteAudio: number;
  isHideVideo: number;
  signalRStatus: number;
  classRoomStatus: number;
  cameraDeviceId: string;
  userRole: UserRole;
}
export interface ToastData {
  message: string;
  isPlayingSound?: boolean;
  bigIcon?: any;
  isMedal?: boolean;
}

const cameraDeviceId = localStorage.getItem(CAMERA_ID_KEY);

const state: AppState = {
  layout: "main",
  appView: AppView.Blank,
  toast: { message: "", isPlayingSound: false },
  contentSignature: "",
  isMuteAudio: MediaStatus.noStatus,
  isHideVideo: MediaStatus.noStatus,
  signalRStatus: SignalRStatus.NoStatus,
  classRoomStatus: ClassRoomStatus.InDashBoard,
  cameraDeviceId: cameraDeviceId || "",
  userRole: UserRole.UnConfirm,
};

export default state;
