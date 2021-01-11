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
  answerList: Array<string>;
}

export interface InteractiveState {
  isDesignatingTarget: boolean;
  targets: Array<Target>;
  localTargets: Array<string>;
  studentsSelected: Array<StudentId>;
  currentUserId: string;
}

const state: InteractiveState = {
  isDesignatingTarget: false,
  targets: [],
  localTargets: [],
  studentsSelected: [],
  currentUserId: "",
};

export default state;
