export interface Pointer {
  x: number;
  y: number;
}
export interface Pencil {
  size: number;
  color: string;
}
export interface AnnotationState {
  mode: number;
  pointer: Pointer;
  drawing: Array<string>;
}

const state: AnnotationState = {
  mode: 0,
  pointer: { x: 0, y: 0 },
  drawing: []
};

export default state;
