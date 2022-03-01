import { ClassRoomStatus, MediaStatus, SignalRStatus } from "@/models";
import { CAMERA_ID_KEY } from "./actions";

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

export enum VCPlatform {
  Agora = 0,
  Zoom = 1,
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

  platform: VCPlatform;
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

  platform: VCPlatform.Zoom,
};

export default state;
