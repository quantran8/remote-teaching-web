import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "./interface";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any>
  implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(): Promise<TeacherGetRoomResponse> {
    return this.get("rooms/teachers");
  }
  teacherStartClassRoom(classId: string, lessonId?: string): Promise<any> {
    return this.create("rooms/create", {
      classId: classId,
      lessonId: lessonId,
    });
  }
  teacherEndClassRoom(roomId?: string): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.delete("rooms/" + roomId);
  }
  studentGetRoomInfo(childId: string): Promise<StudentGetRoomResponse> {
    return this.get(`rooms`,{
      studentId: childId
    });
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();