import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "./interface";
import { TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any>
  implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getAvailableRooms(): Promise<TeacherGetRoomResponse> {
    return this.get("room/teacher");
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
