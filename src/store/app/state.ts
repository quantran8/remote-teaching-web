export interface LayoutState {
  header: {
    visible: boolean;
    backgroundColor?: string;
  };
  footer: {
    visible: boolean;
    backgroundColor?: string;
  };
}

export interface AppState {
  layout: LayoutState;
}

const state: AppState = {
  layout: {
    header: { visible: true },
    footer: { visible: true },
  },
};

export default state;
