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
  toast: string;
  contentSignature: string;
}

const state: AppState = {
  layout: "main",
  appView: AppView.Blank,
  toast: "",
  contentSignature: "",
};

export default state;
