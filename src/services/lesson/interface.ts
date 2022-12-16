import { LessonModel } from "./model";

export interface LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<Array<LessonModel>>;
  getMediaUrl(token: string, mediaId: string): Promise<string>;
}
