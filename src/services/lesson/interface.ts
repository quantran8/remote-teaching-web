import { LessonModel } from "./model";

export interface LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<Array<LessonModel>>;
  getMediaUrl(mediaId: string) : any;
}
