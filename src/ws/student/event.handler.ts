export interface StudentWSEventHandler {
  onStudentJoinClass(payload: any): void;
  onStudentStreamConnect(payload: any): void;
  onStudentMuteAudio(payload: any): void;
  onStudentMuteVideo(payload: any): void;
  onStudentLeave(payload: any): void;
  onStudentDisconnected(payload: any): void;
  onStudentRaisingHand(payload: any): void;
  onStudentLike(payload: any): void;
}