export type LayoutType = "" | "full" | "main";

export interface AppState {
  layout: LayoutType;
}

const state: AppState = {
  layout: "main",
};

export default state;
