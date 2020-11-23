import { ContentService } from "../content.service";
import { TeacherServiceInterface } from "./interface";
import { GetClassesModel } from "./model";
class GLTeacherService extends ContentService
  implements TeacherServiceInterface {
  getClasses(teacherId: string): Promise<GetClassesModel> {
    const url = `users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&isDescending=false&offset=0&limit=20`;
    return this.get(url);
  }
}

export const TeacherService = new GLTeacherService();
