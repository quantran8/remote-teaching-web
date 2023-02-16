import { RoomModel } from "@/models";
import { BaseResponse } from "@/services";
export interface SessionStatusModel {
  teacherId: string;
  helperId: string;
}

export type GetSessionStatusResponse = SessionStatusModel | null;

export type JoinSessionAsHelperResponse = BaseResponse<{}>;
export type GetSessionAsHelperResponse = BaseResponse<RoomModel>;
export type TeacherAcceptHelperResponse = BaseResponse<{}>;
export type TeacherDenyHelperResponse = BaseResponse<{}>;
export type HelperExitResponse = BaseResponse<{}>;
export type TeacherToggleHelperVideo = BaseResponse<{}>;
export enum JoinSessionAsHelperErrorCode {
  SessionIsNotStartedYet = 9,
  HelperIsAvailableInSession = 10,
  WaitingTeacherAccept = 12,
  TeacherDeniedHelper = 13,
}
