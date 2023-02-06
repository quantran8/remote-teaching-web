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

export const joinSessionAsHelperTextBinding = new Map([
  [JoinSessionAsHelperErrorCode.SessionIsNotStartedYet, "The session hasn't started yet"],
  [JoinSessionAsHelperErrorCode.HelperIsAvailableInSession, "Another helper is in this session"],
  [JoinSessionAsHelperErrorCode.TeacherDeniedHelper, "Teacher denied"],
  [
    JoinSessionAsHelperErrorCode.WaitingTeacherAccept,
    "The teacher will grant access to the class. We’ll log you in as soon as the request is approved",
  ],
]);
