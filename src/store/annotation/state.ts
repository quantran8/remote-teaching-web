export interface Pointer {
  x: number;
  y: number;
}
export interface Pencil {
  size: number;
  color: string;
}
export interface Sticker {
  top: number;
  left: number;
  width: number;
  height: number;
}
export interface UserShape {
  UserId: string;
  brushstroke: Array<string>;
}
export interface Drawing {
  brushstrokes: Array<string>;
  studentShapes: UserShape[];
  teacherShapes: UserShape[];
  pencil: Pencil | null;
  studentStrokes: Array<string>;
}
export interface AnnotationState {
  mode: number;
  pointer: Pointer;
  drawing: Drawing;
  stickers: Array<Sticker>;
}

const state: AnnotationState = {
  mode: 0,
  pointer: { x: 0, y: 0 },
  drawing: {
    pencil: null,
    brushstrokes: [],
    studentShapes: [],
    teacherShapes: [],
    studentStrokes: [],
  },
  stickers: [],
};

export default state;
