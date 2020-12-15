export interface TeacherWSEventHandler {
  onTeacherJoinClass(payload: any): void;
  onTeacherStreamConnect(payload: any): void;
  onTeacherMuteAudio(payload: any): void;
  onTeacherMuteVideo(payload: any): void;
  onTeacherMuteStudentVideo(payload: any): void;
  onTeacherMuteStudentAudio(payload: any): void;
  onTeacherMuteAllStudentVideo(payload: any): void;
  onTeacherMuteAllStudentAudio(payload: any): void;
  onTeacherEndClass(payload: any): void;
  onTeacherDisconnect(payload: any): void;
  onTeacherSetFocusTab(payload: any): void;
  onTeacherUpdateGlobalAudio(payload: any): void;
  onTeacherUpdateLocalAudio(payload: any): void;
  onTeacherUpdateStudentBadge(payload: any): void;
}
