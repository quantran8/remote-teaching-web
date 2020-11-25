import { TeacherGetRoomResponse } from './model';

export interface RemoteTeachingServiceInterface {
  getActiveClassRoom(): Promise<TeacherGetRoomResponse>;
}
