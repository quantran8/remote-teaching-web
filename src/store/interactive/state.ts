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

export interface StudentId {
  id: string;
}

export interface InteractiveState {
  isDesignatingTarget: boolean;
  targets: Array<Target>;
  studentsSelected: Array<StudentId>;
  currentUserId: string;
}

const state: InteractiveState = {
  isDesignatingTarget: false,
  targets: [],
  studentsSelected: [],
  currentUserId: "",
};

export default state;
