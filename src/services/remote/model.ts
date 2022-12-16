import { GenerateTokenModal, RoomModel, UnitAndLessonModel } from "@/models";

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type TeacherGetRoomResponse = BaseResponse<RoomModel>;

export type StudentGetRoomResponse = BaseResponse<RoomModel>;

export type UnitAndLessonResponse = BaseResponse<UnitAndLessonModel[]>;

export type GenerateTokenResponse = GenerateTokenModal;
