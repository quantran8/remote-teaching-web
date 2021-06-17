import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "@/services";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any> implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(bfp: string): Promise<TeacherGetRoomResponse> {
    return this.get("teacher/online-session", { browserFingerPrinting: bfp });
  }
  teacherStartClassRoom(classId: string, groupId?: string): Promise<any> {
    return this.create(`teacher/join/${classId}/${groupId}`, {
      device: "test-windown10",
      browser: "test-Chrome",
      resolution: "test-1024x1024",
      bandwidth: "test-5555",
    });
  }
  teacherEndClassRoom(roomId?: string): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.update("teacher/end-class/" + roomId);
  }
  studentGetRoomInfo(childId: string, bfp: string): Promise<StudentGetRoomResponse> {
    return this.get(`student/join-session`, {
      studentId: childId,
      browserFingerPrinting: bfp,
    });
  }
  acceptPolicy(role: string): Promise<any> {
    return this.get(`policy/${role}/is-accepted`);
  }
  submitPolicy(role: string): Promise<any> {
    return this.create(`policy/${role}/accept/true`);
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
