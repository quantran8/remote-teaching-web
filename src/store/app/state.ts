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
}

export interface ToastData {
  message: string;
  isPlayingSound?: boolean;
}

const state: AppState = {
  layout: "main",
  appView: AppView.Blank,
  toast: { message: "", isPlayingSound: false },
  contentSignature: "",
};

export default state;
