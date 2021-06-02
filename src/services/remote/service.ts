import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "@/services";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
class GLRemoteTeachingService extends GLServiceBase<any, any> implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(bfp: string): Promise<TeacherGetRoomResponse> {
    return this.get("rooms/teachers", { browserFingerPrinting: bfp });
  }
  teacherStartClassRoom(classId: string, groupId?: string): Promise<any> {
    return this.create(`rooms/join/${classId}/${groupId}`);
  }
  teacherEndClassRoom(roomId?: string): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.update("rooms/end-class/" + roomId);
  }
  studentGetRoomInfo(childId: string, bfp: string): Promise<StudentGetRoomResponse> {
    return this.get(`rooms`, {
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
