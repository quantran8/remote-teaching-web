import { ResourceModel } from "@/models/resource.model";
import { AdminService } from "../admin.service";
import { TeacherServiceInterface } from "./interface";
import { GetClassesModel, AccessibleSchoolQueryParam } from "./model";
class GLTeacherService extends AdminService implements TeacherServiceInterface {
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]> {
    return this.get("schools/accessibleschools", params);
  }
  getClasses(teacherId: string, schoolId: string): Promise<GetClassesModel> {
    const url = `resources/users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&schoolId=${schoolId}&isDescending=false&includeGroup=true&offset=0&limit=20`;
    return this.get(url);
  }
}

export const TeacherService = new GLTeacherService();
