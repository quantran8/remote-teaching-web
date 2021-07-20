import { AdminService } from "../admin.service";
class GLStudentService extends AdminService {
  getAvatarStudent(studentId: string): Promise<any> {
    return this.get("students/avatars", { studentIds: studentId });
  }
  getAllAvatarStudent(listIds: string[]): Promise<any> {
    let studentId = "";
    listIds.map((id: string, index: number) => {
      if (index != 0) {
        studentId += "&";
      }
      studentId += "studentIds=" + id;
    });
    return this.get(`students/avatars?${studentId}&`);
  }
}

export const StudentService = new GLStudentService();
