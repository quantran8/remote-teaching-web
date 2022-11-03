import { GLContentService } from "../content.service";
import { LessonServiceInterface } from "./interface";
import { LessonModel } from "./model";
class LessonServiceClass extends GLContentService implements LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<LessonModel[]> {
    return this.get(`versions/lessonPlane/${unit}`);
  }
  getMediaUrl(mediaId: string) : any {
    return this.get(`resource/GetDownloadMediaUrl?mediaId=${mediaId}`);
  }
}

export const LessonService = new LessonServiceClass();
