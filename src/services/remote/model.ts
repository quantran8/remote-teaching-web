import { GenerateTokenModal, RoomModel, UnitAndLessonModel } from "@/models";

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  code?: number;
}
export interface NextSessionResponse {
  classInfo: {
    classId: string;
    className: string;
    groupId: string;
    groupName: string;
    lesson: number;
    startTime: null | string;
    unit: number;
  };
  nextTime: null | string;
  sessionId: string | null;
  studentId: string;
}

export type TeacherGetRoomResponse = BaseResponse<RoomModel>;

export type StudentGetRoomResponse = BaseResponse<RoomModel>;

export type UnitAndLessonResponse = BaseResponse<UnitAndLessonModel[]>;

export type GenerateTokenResponse = GenerateTokenModal;
