import { AdminService } from "../admin.service";
class GLStudentService extends AdminService {
  getAvatarStudent(studentId: string): Promise<any> {
    return this.get("students/avatars", { studentIds: studentId });
  }
}

export const StudentService = new GLStudentService();
