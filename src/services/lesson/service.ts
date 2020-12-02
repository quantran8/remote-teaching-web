import { AdminService } from "../admin.service";
import { ContentService } from "../content.service";
import { LessonServiceInterface } from "./interface";
import { LessonModel } from "./model";
class LessonServiceClass extends ContentService
  implements LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<LessonModel[]> {
    return this.get(`versions/lessonPlane/${unit}`);
  }
}

export const LessonService = new LessonServiceClass();
