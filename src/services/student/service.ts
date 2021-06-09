import { AdminService } from "../admin.service";
class GLStudentService extends AdminService {
  getAvatarTeacher(teacherId: string): Promise<any> {
    return this.get(`schools/teacher/${teacherId}/avatar`);
  }
  getAvatarStudent(studentId: string): Promise<any> {
    return this.get(`students/${studentId}/avatar`);
  }
}

export const StudentService = new GLStudentService();
