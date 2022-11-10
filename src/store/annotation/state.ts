import { FabricObject } from "@/ws";

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
  fabrics: FabricObject[];
}
export interface AnnotationState {
  mode: number;
  pointer: Pointer;
  drawing: Drawing;
  oneToOne: Drawing;
  stickers: Array<Sticker>;
  lastFabricUpdated: null | LastFabricUpdated;
  imgWidth?: number;
  imgHeight?: number;
  imgRenderWidth?: number;
  imgRenderHeight?: number;
  isImgProcessing?: boolean;
  pencilPath: Array<{
    id: string;
    points: Array<Pointer>;
    strokeColor: string;
    strokeWidth: number;
  }>
}

export interface LastFabricUpdated {
  type: "modify" | "create";
  data: FabricObject;
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
    fabrics: [],
  },
  oneToOne: {
    pencil: null,
    brushstrokes: [],
    studentShapes: [],
    teacherShapes: [],
    studentStrokes: [],
    fabrics: [],
  },
  stickers: [],
  lastFabricUpdated: null,
  pencilPath: []
};

export default state;
