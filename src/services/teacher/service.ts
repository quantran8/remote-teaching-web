import { ClassGroupModel, ClassModelSchedules, StudentGroupModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { AdminService } from "../admin.service";
import { TeacherServiceInterface } from "./interface";
import { AccessibleSchoolQueryParam, GetClassesModel, ScheduleParam, SkipScheduleResponse } from "./model";
class GLTeacherService extends AdminService implements TeacherServiceInterface {
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]> {
    return this.get("schools/accessibleschools", params);
  }
  getScheduleCalendar(schoolId: string, classId: string, groupId: string, startDate: string, endDate: string): Promise<any> {
    let url = `schedule/${schoolId}/${startDate}`;
    if (!schoolId) {
      url = `schedule/${startDate}`;
    }
    return this.get(url, { endDate: endDate, classId: classId, groupId: groupId, includeSkip: true });
  }
  createSchedule(params: ScheduleParam): Promise<any> {
    const url = `schedule/create`;
    return this.create(url, params);
  }
  updateSchedule(params: ScheduleParam): Promise<any> {
    const url = `schedule/update`;
    return this.create(url, params);
  }
  deleteSchedule(scheduleId: string) {
    return this.delete(`schedule/delete/${scheduleId}`);
  }
  skipSchedule(params: ScheduleParam): Promise<SkipScheduleResponse> {
    return this.create(`schedule/skip`, params);
  }
  getClasses(teacherId: string, schoolId: string): Promise<GetClassesModel> {
    const url = `resources/users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&schoolId=${schoolId}&isDescending=false&includeGroup=true&offset=0&limit=20`;
    return this.get(url);
  }
  getAllClassesSchedule(schoolId: string): Promise<Array<ClassModelSchedules>> {
    const url = `schoolclass/${schoolId}`;
    return this.get(url);
  }
  getGroupStudents(classId: string, groupId: string): Promise<Array<StudentGroupModel>> {
    const url = `${classId}/groups/${groupId}/students`;
    return this.get(url);
  }
  getAllClassesOfAllSchools(): Promise<any> {
    const url = `schoolclass/teacher-dashboard`;
    return this.get(url);
  }
  getClassGroup(): Promise<Array<ClassGroupModel>> {
    const url = "schoolclass/class-group";
    return this.get(url);
  }
  getAllScheduleCalendar(startDate: string): Promise<any> {
    const url = `schedule/${startDate}`;
    return this.get(url, { includeSkip: true });
  }
}

export const TeacherService = new GLTeacherService();
