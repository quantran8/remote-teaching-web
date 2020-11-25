import { StudentModel } from "./student.model";
import { TeacherModel } from "./teacher.model";

export interface RoomModel {
  id: string;
  status: number;
  teacher: TeacherModel;
  zoomSetting: any;
  agoraInfo: {
    token: string;
    chanelId: string;
    userId: string;
  };
  students: Array<StudentModel>;
  lessons: any;
  contentModels: Array<any>;
  zoomId: string;
  zoomMeetingNumber: number;
  zoomPassword: string;
}
