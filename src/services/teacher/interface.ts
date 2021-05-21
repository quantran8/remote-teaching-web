import { ResourceModel } from "@/models/resource.model";
import { GetClassesModel, AccessibleSchoolQueryParam } from ".";

export interface TeacherServiceInterface {
  getClasses(teacherId: string, schoolId: string): Promise<GetClassesModel>;
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]>;
}
