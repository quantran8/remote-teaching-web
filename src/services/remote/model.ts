import { RoomModel } from "@/models";

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type TeacherGetRoomResponse = BaseResponse<RoomModel>;
