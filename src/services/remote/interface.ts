import { TeacherGetRoomResponse } from './model';

export interface RemoteTeachingServiceInterface {
  getAvailableRooms(): Promise<TeacherGetRoomResponse>;
}
