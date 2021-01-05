import { Target } from "@/store/interactive/state";
import { StudentModel } from "./student.model";
import { TeacherModel } from "./teacher.model";

export interface ExposureItemMediaModel {
  id: string;
  url: string;
  resolution: string;
}
export interface ExposureItemModel {
  id: string;
  unit: number;
  title: string;
  page: Array<ExposureItemMediaModel>;
}
export interface ExposureContentModel {
  id: string;
  title: string;
  pageSelected: string;
  contentType: {
    id: number;
    name: string;
  };
  unit: number;
  played: boolean;
  maxDuration: string;
  contents: Array<ExposureItemModel>;
}
export interface InteractiveModel {
  answerMode: number;
  contentId: string;
  studentInteractives: Array<{
    studentId: string;
    answerList: Array<string>;
  }>;
  targets: Array<Target>;
}
export interface LessonPlanModel {
  contentSelected: string;
  contents: Array<ExposureContentModel>;
  contentStorageUrl: string;
  isBlackout: boolean;
  totalTime: string;
  playedTime: string;
  lessonAction: number;
  interactive: InteractiveModel;
}
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
  lessonPlan: LessonPlanModel;
  students: Array<StudentModel>;
  contents: Array<any>;
  focusTab: number;
  studentsAudio: Array<string>;
  globalStudentsAudio: Array<string>;
}
