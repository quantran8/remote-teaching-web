export interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  color: string;
  type: string;
  reveal: boolean;
}

export interface InteractiveState {
  isDesignatingTarget: boolean;
  targets: Array<Target>;
}

const state: InteractiveState = {
  isDesignatingTarget: false,
  targets: [],
};

export default state;
