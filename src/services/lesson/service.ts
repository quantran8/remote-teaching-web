import { GLContentService } from "../content.service";
import { LessonServiceInterface } from "./interface";
import { LessonModel } from "./model";
class LessonServiceClass extends GLContentService implements LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<LessonModel[]> {
    return this.get(`versions/lessonPlane/${unit}`);
  }
}

export const LessonService = new LessonServiceClass();
