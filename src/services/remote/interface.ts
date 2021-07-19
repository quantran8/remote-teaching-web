import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";

export interface RemoteTeachingServiceInterface {
  getActiveClassRoom(bfp: string): Promise<TeacherGetRoomResponse>;
  studentGetRoomInfo(childId: string, bfp: string): Promise<StudentGetRoomResponse>;
}
