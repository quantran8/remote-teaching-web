import { GLServiceBase } from "vue-glcommonui";
import { HelperServiceInterface } from "./interface";
import {
	GetSessionAsHelperResponse,
	GetSessionStatusResponse,
	HelperExitResponse,
	JoinSessionAsHelperResponse,
	TeacherAcceptHelperResponse,
	TeacherDenyHelperResponse,
	TeacherToggleHelperVideo
} from "./model";
class HelperServiceClass extends GLServiceBase<any, any> implements HelperServiceInterface {
  serviceRoute = { prefix: "remote/v1" };
  getSessionStatus(groupId: string): Promise<GetSessionStatusResponse> {
    return this.get("helper/session-status", { groupId });
  }
  joinSessionAsHelper(groupId: string, browserFingerPrinting = ""): Promise<JoinSessionAsHelperResponse> {
    return this.get("helper/request-join-session", { groupId, browserFingerPrinting });
  }
  getSessionAsHelper(groupId: string, browserFingerPrinting = ""): Promise<GetSessionAsHelperResponse> {
    return this.get("helper/session-data", { groupId, browserFingerPrinting });
  }

  exitSession(): Promise<HelperExitResponse> {
    return this.update("helper/exit-session");
  }
  teacherAcceptHelper(helperId: string, helperName: string): Promise<TeacherAcceptHelperResponse> {
    return this.create("teacher/accept-helper", { helperId, helperName });
  }
  teacherDenyHelper(helperId: string): Promise<TeacherDenyHelperResponse> {
    return this.create(`teacher/deny-helper?helperId=${helperId}`);
  }
  teacherToggleHelperVideo(show: boolean): Promise<TeacherToggleHelperVideo> {
    return this.create(`teacher/toggle-helper-video?show=${show}`);
  }
}

export const HelperService = new HelperServiceClass();
