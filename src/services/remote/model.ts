export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface RoomModel {
  id: string;
  status: number;
  teacherModel: any;
  zoomSetting: any;
  students: Array<any>;
  lessons: any;
  contentModels: Array<any>;
  zoomId: string;
  zoomMeetingNumber: number;
  zoomPassword: string;
}

export type TeacherGetRoomResponse = BaseResponse<Array<RoomModel>>;
