import { ResourceModel } from "@/models/resource.model";
import { GetClassesModel, AccessibleSchoolQueryParam, AccessibleClassQueryParam, GetAccessibleClassResponseModel } from ".";

export interface TeacherServiceInterface {
  getClasses(teacherId: string): Promise<GetClassesModel>;
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]>;
  getAccessibleClasses(params: AccessibleClassQueryParam): Promise<GetAccessibleClassResponseModel>;
}
