import { ClassModel } from "@/models/class.model";
import { GLServiceBase, ServiceRoute } from "./base.service";

export class ContentService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "admin/v1/resources" };

  teacherGetClasses(teacherId: string): Promise<Array<ClassModel>> {
    const url = `users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&isDescending=false&offset=0&limit=20`;
    return this.get(url);
  }
}
