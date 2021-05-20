import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "@/services";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any> implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(): Promise<TeacherGetRoomResponse> {
    return this.get("rooms/teachers");
  }
  teacherStartClassRoom(classId: string, lessonId?: string): Promise<any> {
    return this.create(`rooms/join/${classId}/${lessonId}`);
  }
  teacherEndClassRoom(roomId?: string): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.update("rooms/end-class/" + roomId);
  }
  studentGetRoomInfo(childId: string): Promise<StudentGetRoomResponse> {
    return this.get(`rooms`, {
      studentId: childId,
    });
  }
  acceptPolicy(): Promise<any> {
    return this.get("policy/is-accepted");
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
