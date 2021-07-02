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

export interface TeachingActivityModel {
  contentId: any;
  id: string;
  isCommon: boolean;
  text: string;
  versionGroupId: string;
}
export interface TeachingActivityItemModel {
  contentExposureId: string;
  imageName: any;
  imageUrl: any;
  metaData: any;
  pageId: any;
  sequence: number;
  teachingActivity: TeachingActivityModel;
  teachingActivityId: string;
}

export interface ContentItemModel {}

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
  contentExposureTeachingActivity: Array<TeachingActivityItemModel>;
  page: Array<ExposureItemMediaModel>;
  thumbnailUrl: any;
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
export interface UserShapeModel {
  UserId: string;
  brushstroke: Array<string>;
}
export interface DrawingModel {
  pencil: PencilModel | null;
  brushstrokes: Array<string>;
  studentShapes: UserShapeModel[];
  teacherShapes: UserShapeModel[];
  studentStrokes: Array<string>;
  studentBrushstrokes: Array<string>;
  shapes: UserShapeModel[];
}

export interface AnnotationModel {
  mode: number;
  pointer: { x: number; y: number };
  drawing: DrawingModel;
  oneToOne: DrawingModel;
  stickers: Array<Sticker>;
}

export interface ClassRoomModel {
  classId: string;
  className: string;
  groupId: string;
  groupName: string;
  lesson: number;
  unit: number;
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
  studentOneToOne: string;
  classInfo: ClassRoomModel;
  lessonPlan: LessonPlanModel;
  students: Array<StudentModel>;
  contents: Array<any>;
  focusTab: number;
  studentsAudio: Array<string>;
  globalStudentsAudio: Array<string>;
  isShowWhiteBoard: boolean;
  annotation: AnnotationModel;
}
