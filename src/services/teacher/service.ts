import { ResourceModel } from "@/models/resource.model";
import { AdminService } from "../admin.service";
import { TeacherServiceInterface } from "./interface";
import { GetClassesModel, AccessibleSchoolQueryParam, ScheduleParam } from "./model";
class GLTeacherService extends AdminService implements TeacherServiceInterface {
  getAccessibleSchools(params: AccessibleSchoolQueryParam): Promise<ResourceModel[]> {
    return this.get("schools/accessibleschools", params);
  }
  getScheduleCalendar(schoolId: string, classId: string, groupId: string, startDate: string, endDate: string): Promise<any> {
    const url = `schedule/${schoolId}/${startDate}?endDate=${endDate}&classId=${classId}&groupId=${groupId}&`;
    return this.get(url);
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
  skipSchedule(params: ScheduleParam) {
    return this.create(`schedule/skip`, params);
  }
  getClasses(teacherId: string, schoolId: string): Promise<GetClassesModel> {
    const url = `resources/users/${teacherId}/landingresources/0?filterText=&disabled=false&sortBy=schoolName&schoolId=${schoolId}&isDescending=false&includeGroup=true&offset=0&limit=20`;
    return this.get(url);
  }
  getAvatarIndependent(studentId: string, teacherId: string): Promise<any> {
    return this.get(`students/${studentId}/avatar/${teacherId}`);
  }
}

export const TeacherService = new GLTeacherService();
