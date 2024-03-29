import { Sticker } from "@/store/annotation/state";
import { VCPlatform } from "@/store/app/state";
import { Target } from "@/store/interactive/state";
import { TargetsVisibleList } from "@/store/lesson/state";
import { FabricObject } from "@/ws";
import { HelperModel } from "./helper.model";
import { StudentModel } from "./student.model";
import { TeacherModel } from "./teacher.model";

export interface ExposureItemMediaModel {
  id: string;
  url: string;
  resolution: string;
  teacherUseOnly: boolean;
}
export interface AlternateItemMediaModel {
  contentId: string;
  id: string;
  mediaSlotId: number;
  mediaStatusId: number;
  mediaTypeId: number;
  page: Array<ExposureItemMediaModel>;
  revision: number;
  url: string;
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
  contentRootType: number;
  media: Array<AlternateItemMediaModel>;
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
  userId: string;
  brushstrokes: Array<string>;
}
export interface DrawingModel {
  pencil: PencilModel | null;
  brushstrokes: Array<string>;
  studentShapes: UserShapeModel[];
  teacherShapes: UserShapeModel[];
  studentStrokes: Array<string>;
  studentBrushstrokes: Array<string>;
  shapes: UserShapeModel[];
  fabrics: FabricObject[];
  isShowingAllShapes: boolean;
  visibleShapes: TargetsVisibleList[];
}

export interface AnnotationModel {
  mode: number;
  pointer: { x: number; y: number };
  drawing: DrawingModel;
  oneToOne: DrawingModel;
  oneOneDrawing: DrawingModel;
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
  ratio: number;
  position:
    | {
        x: number;
        y: number;
      }
    | null
    | undefined;
}
export interface RoomModel {
  id: string;
  status: number;
  teacher: TeacherModel;
  helper: HelperModel;
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
  teachingMode: number;
  studentsAudio: Array<string>;
  isShowWhiteBoard: boolean;
  annotation: AnnotationModel;
  oneAndOneDto: any;
  videoPlatformProvider: VCPlatform;
  isTeacherVideoMirror: boolean;
  isStudentVideoMirror: boolean;
}

export interface RoomUsersModel {
  teacher: TeacherModel;
  students: Array<StudentModel>;
}

export interface UnitAndLessonModel {
  lessonPlanVersionId: string;
  sequence: number;
  unit: number;
  unitId: number;
}

export interface GenerateTokenModal {
  token: string;
}
