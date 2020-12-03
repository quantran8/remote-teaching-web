import { StudentModel } from "./student.model";
import { TeacherModel } from "./teacher.model";

export interface RoomModel {
  id: string;
  classId: string;
  status: number;
  teacher: TeacherModel;
  streamInfo: {
    token: string;
    chanelId: string;
    userId: string;
    appId: string;
  };
  students: Array<StudentModel>;
  contents: Array<any>;
  focusTab: number;
  studentsAudio: Array<string>;
  globalStudentsAudio: Array<string>;
}
