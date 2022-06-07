import { GLServiceBase } from "vue-glcommonui";
import { RemoteTeachingServiceInterface } from "@/services";
import { GenerateTokenResponse, StudentGetRoomResponse, TeacherGetRoomResponse, UnitAndLessonResponse } from "./model";
import { JoinSessionModel } from "@/models/join-session.model";
import { store } from "@/store";
class GLRemoteTeachingService extends GLServiceBase<any, any> implements RemoteTeachingServiceInterface {
  serviceRoute = { prefix: "remote/v1" };

  getActiveClassRoom(bfp: string): Promise<TeacherGetRoomResponse> {
    return this.get("teacher/online-session", { browserFingerPrinting: bfp });
  }

  teacherStartClassRoom(startModel: JoinSessionModel): Promise<any> {
    return this.create("teacher/join-session", { ...startModel, videoPlatformProvider: store.getters.platform });
  }

  teacherEndClassRoom(roomId?: string, markAsComplete?: boolean): Promise<any> {
    if (!roomId) return Promise.resolve(null);
    return this.update("teacher/end-class/" + roomId + `?MarkAsComplete=${markAsComplete?.toString()}`);
  }

  studentGetRoomInfo(childId: string, bfp: string): Promise<StudentGetRoomResponse> {
    const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
    return this.get(`student/join-session`, {
      studentId: childId,
      resolution,
      browserFingerPrinting: bfp,
    });
  }

  putTeacherBandwidth(bandwidth: string): Promise<any> {
    const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
    return this.update(`logs/teacher?bandwidth=${bandwidth}&resolution=${resolution}&`);
  }

  putStudentBandwidth(studentId: string, bandwidth: string): Promise<any> {
    const resolution = window.screen.width * window.devicePixelRatio + "x" + window.screen.height * window.devicePixelRatio;
    return this.update(`logs/student/${studentId}?bandwidth=${bandwidth}&resolution=${resolution}&`);
  }

  acceptPolicy(role: string): Promise<any> {
    return this.get(`policy/${role}/is-accepted`);
  }

  submitPolicy(role: string): Promise<any> {
    return this.create(`policy/${role}/accept/true`);
  }

  getLinkStoryDictionary(unitId: string, lessonId: string): Promise<any> {
    return this.get(`student/story-dictionary/unit/${unitId}/lesson/${lessonId}`);
  }

  getListLessonByUnit(classId: string, groupId: string, unit: number): Promise<UnitAndLessonResponse> {
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

  teacherDrawLine(brushStrokes: string, sessionId: string): Promise<any> {
    return this.create(`draw/teacher/line`, {
      brushesStroke: brushStrokes,
      sessionId: sessionId,
    });
  }
  teacherAddShape(shapes: string[], sessionId: string): Promise<any> {
    return this.create(`draw/teacher/shape`, {
      shapes: shapes,
      sessionId: sessionId,
    });
  }
  studentDrawLine(brushStrokes: string[], studentId: string, sessionId: string): Promise<any> {
    return this.create(`draw/student/line`, {
      brushesStroke: brushStrokes,
      studentId: studentId,
      sessionId: sessionId,
    });
  }
  studentAddShapes(shapes: string[], studentId: string, sessionId: string): Promise<any> {
    return this.create(`draw/student/shape`, {
      shapes: shapes,
      studentId: studentId,
      sessionId: sessionId,
    });
  }
  generateOneToOneToken(roomId?: string, studentId?: string):  Promise<GenerateTokenResponse> {
	let api = `zoom/generate-one-to-one-token?roomId=${roomId}`
	if(studentId){
		api += `&studentId=${studentId}`
	}
	return this.get(`${api}&`);
  }
}

export const RemoteTeachingService = new GLRemoteTeachingService();
