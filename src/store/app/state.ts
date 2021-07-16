import { ClassRoomStatus, MediaStatus, SignalRStatus } from "@/models";

export type LayoutType = "" | "full" | "main";
export enum AppView {
  Authorized = 1,
  UnAuthorized = 2,
  NotFound = 3,
  Blank = 4,
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
}

export interface ToastData {
  message: string;
  isPlayingSound?: boolean;
  bigIcon?: any;
  isMedal?: boolean;
}

const state: AppState = {
  layout: "main",
  appView: AppView.Blank,
  toast: { message: "", isPlayingSound: false },
  contentSignature: "",
  isMuteAudio: MediaStatus.noStatus,
  isHideVideo: MediaStatus.noStatus,
  signalRStatus: SignalRStatus.NoStatus,
  classRoomStatus: ClassRoomStatus.InDashBoard,
};

export default state;
