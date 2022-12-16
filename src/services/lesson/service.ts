import { GLContentService } from "../content.service";
import { LessonServiceInterface } from "./interface";
import { LessonModel } from "./model";
class LessonServiceClass extends GLContentService implements LessonServiceInterface {
  getLessonByUnit(unit: number): Promise<LessonModel[]> {
    return this.get(`versions/lessonPlane/${unit}`);
  }

  async getMediaUrl(token: string, mediaId: string): Promise<string> {
    const result = await fetch(`${process.env.VUE_APP_API_PREFIX}content/v1/resource/GetDownloadMediaUrl?mediaId=${mediaId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result.json();
  }
}

export const LessonService = new LessonServiceClass();
