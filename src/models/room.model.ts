import { Target } from "@/store/interactive/state";
import { StudentModel } from "./student.model";
import { TeacherModel } from "./teacher.model";
import { Sticker } from "@/store/annotation/state";

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

export interface PencilModel {
  size: number;
  color: string;
}

export interface DrawingModel {
  pencil: PencilModel | null;
  brushstrokes: Array<string>;
}

export interface AnnotationModel {
  mode: number;
  pointer: { x: number; y: number };
  drawing: DrawingModel;
  stickers: Array<Sticker>;
}

export interface ClassRoomModel {
  id: string;
  name: string;
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
  annotation: AnnotationModel;
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
  studentOneToOne: string;
  classInfo: ClassRoomModel;
  lessonPlan: LessonPlanModel;
  students: Array<StudentModel>;
  contents: Array<any>;
  focusTab: number;
  studentsAudio: Array<string>;
  globalStudentsAudio: Array<string>;
}
