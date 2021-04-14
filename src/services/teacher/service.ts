import { ResourceModel } from "@/models/resource.model";
import { AdminService } from "../admin.service";
import { TeacherServiceInterface } from "./interface";
import {
  GetClassesModel,
  AccessibleSchoolQueryParam,
  AccessibleClassQueryParam,
  GetAccessibleClassResponseModel
} from "./model";
class GLTeacherService extends AdminService implements TeacherServiceInterface {
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]> {
    return this.get("schools/accessibleschools", params);
  }
  getAccessibleClasses(params: AccessibleClassQueryParam): Promise<GetAccessibleClassResponseModel> {
    return this.get("classes/accessibleclasses", params);
  }

  getClasses(teacherId: string): Promise<GetClassesModel> {
    const url = `resources/users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&isDescending=false&offset=0&limit=20`;
    return this.get(url);
  }
}

export const TeacherService = new GLTeacherService();
