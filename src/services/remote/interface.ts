import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";

export interface RemoteTeachingServiceInterface {
  getActiveClassRoom(): Promise<TeacherGetRoomResponse>;
  studentGetRoomInfo(childId: string): Promise<StudentGetRoomResponse>;
}
