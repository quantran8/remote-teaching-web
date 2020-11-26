import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "./interface";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any>
  implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(): Promise<TeacherGetRoomResponse> {
    return this.get("room/teacher");
  }

  studentGetRoomInfo(childId: string): Promise<StudentGetRoomResponse> {
    return this.get(`room/student?childId=${childId}&`);
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
