import {
	GetSessionAsHelperResponse,
	HelperExitResponse,
	JoinSessionAsHelperResponse,
	SessionStatusModel,
	TeacherAcceptHelperResponse,
	TeacherDenyHelperResponse,
	TeacherToggleHelperVideo
} from "./model";

export interface HelperServiceInterface {
  getSessionStatus(groupId: string): Promise<SessionStatusModel | null>;
  joinSessionAsHelper(groupId: string, browserFingerPrinting: string): Promise<JoinSessionAsHelperResponse>;
  getSessionAsHelper(groupId: string, browserFingerPrinting: string): Promise<GetSessionAsHelperResponse>;
  exitSession(): Promise<HelperExitResponse>;
  teacherAcceptHelper(helperId: string, helperName: string): Promise<TeacherAcceptHelperResponse>;
  teacherToggleHelperVideo(show: boolean): Promise<TeacherToggleHelperVideo>;
  teacherDenyHelper(helperId: string): Promise<TeacherDenyHelperResponse>;
}
