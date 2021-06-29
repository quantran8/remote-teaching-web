import { GLServiceBase, ServiceRoute } from "../base.service";
import { RemoteTeachingServiceInterface } from "@/services";
import { StudentGetRoomResponse, TeacherGetRoomResponse } from "./model";
import { JoinSessionModel } from "@/models/join-session.model";
import DeviceDetector from "device-detector-js";
class GLRemoteTeachingService extends GLServiceBase<any, any> implements RemoteTeachingServiceInterface {
  serviceRoute: ServiceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(bfp: string): Promise<TeacherGetRoomResponse> {
    return this.get("teacher/online-session", { browserFingerPrinting: bfp });
  }

  teacherStartClassRoom(startModel: JoinSessionModel): Promise<any> {
    return this.create("teacher/join-session", startModel);
  }

  teacherEndClassRoom(roomId?: string): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.update("teacher/end-class/" + roomId);
  }

  studentGetRoomInfo(childId: string, bfp: string): Promise<StudentGetRoomResponse> {
    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(navigator.userAgent);
    const resolution = window.screen.width * window.devicePixelRatio + "x" + window.screen.height * window.devicePixelRatio;
    return this.get(`student/join-session`, {
      studentId: childId,
      browser: device.client ? device.client.name : "",
      device: device.device ? device.device.type : "",
      bandwidth: "",
      resolution: resolution,
      browserFingerPrinting: bfp,
    });
  }

  putTeacherBandwidth(bandwidth: string, resolution: string): Promise<any> {
    return this.update("logs/teacher" + { bandwidth, resolution });
  }

  putStudentBandwidth(studentId: string, bandwidth: string, resolution: string): Promise<any> {
    return this.update(`logs/student/${studentId}`, { bandwidth, resolution });
  }

  acceptPolicy(role: string): Promise<any> {
    return this.get(`policy/${role}/is-accepted`);
  }

  submitPolicy(role: string): Promise<any> {
    return this.create(`policy/${role}/accept/true`);
  }

  getListLessonByUnit(classId: string, groupId: string, unit: number): Promise<any> {
    return this.get(`lesson-plan/sequence/class/${classId}/group/${groupId}/unit/${unit}`);
  }

  getStudentNextSession(listIds: string[]): Promise<any> {
    let studentId = "";
    listIds.map((id: string, index: number) => {
      if (index != 0) {
        studentId += "&";
      }
      studentId += "studentId=" + id;
    });
    return this.get(`student/next-session?${studentId}&`);
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
