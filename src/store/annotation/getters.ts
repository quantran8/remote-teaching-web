import { FabricObject } from "@/ws";
import { GetterTree } from "vuex";
import { AnnotationState, LastFabricUpdated, Pointer, Sticker, UserShape } from "./state";

const DEFAULT_RESOLUTION = "1024X722";

const getters: GetterTree<AnnotationState, any> = {
  pointer(state: AnnotationState): Pointer {
    return state.pointer;
  },
  mode(state: AnnotationState): number {
    return state.mode;
  },
  isPointerMode(state: AnnotationState): boolean {
    return state.mode === 1;
  },
  isDrawMode(state: AnnotationState): boolean {
    return state.mode === 2;
  },
  isStickerMode(state: AnnotationState): boolean {
    return state.mode === 3;
  },
  shapes(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
  oneOneTeacherStrokes(state: AnnotationState): Array<string> {
    return state.oneToOne?.brushstrokes;
  },
  undoShape(state: AnnotationState): Array<string> {
    return state.drawing?.brushstrokes;
  },
  undoStrokeOneOne(state: AnnotationState): Array<string> {
    return state.oneToOne?.brushstrokes;
  },
  stickers(state: AnnotationState): Array<Sticker> {
    return state.stickers;
  },
  studentShape(state: AnnotationState): Array<UserShape> {
    return state.drawing?.studentShapes;
  },
  oneStudentShape(state: AnnotationState): Array<UserShape> {
    return state.oneToOne?.studentShapes;
  },
  teacherShape(state: AnnotationState): Array<UserShape> {
    return state.drawing?.teacherShapes;
  },
  oneTeacherShape(state: AnnotationState): Array<UserShape> {
    return state.oneToOne?.teacherShapes;
  },
  studentStrokes(state: AnnotationState): Array<string> {
    return state.drawing?.studentStrokes;
  },
  oneOneStudentStrokes(state: AnnotationState): Array<string> {
    return state.oneToOne?.studentStrokes;
  },
  fabricItems(state: AnnotationState): FabricObject[] {
    return state.drawing.fabrics;
  },
  fabricItemsOneToOne(state: AnnotationState): FabricObject[] {
    return state.oneToOne.fabrics;
  },
  lastFabricUpdated(state: AnnotationState): LastFabricUpdated | null {
    return state.lastFabricUpdated;
  },
  imgWidth(state: AnnotationState): number {
    return state.imgWidth || parseInt(DEFAULT_RESOLUTION.split("X")[0]);
  },
  imgHeight(state: AnnotationState): number {
    return state.imgHeight || parseInt(DEFAULT_RESOLUTION.split("X")[1]);
  },
  imgRenderWidth(state: AnnotationState): number {
    return state.imgRenderWidth ?? 0;
  },
  imgRenderHeight(state: AnnotationState): number {
    return state.imgRenderHeight ?? 0;
  },
  isImgProcessing(state: AnnotationState): boolean {
    return state.isImgProcessing ?? false;
  },
  pencilPath(state: AnnotationState) {
    return state.pencilPath;
  },
};

export default getters;
