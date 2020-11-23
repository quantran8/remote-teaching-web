import { GetClassesModel } from ".";

export interface TeacherServiceInterface {
  getClasses(teacherId: string): Promise<GetClassesModel>;
}
