export interface StudentWSEventHandler {
  onStudentJoinClass(payload: any): void;
  onStudentStreamConnect(payload: any): void;
  onStudentMuteAudio(payload: any): void;
  onStudentMuteVideo(payload: any): void;
  onStudentLeave(payload: any): void;
  onStudentDisconnected(payload: any): void;
  onStudentRaisingHand(payload: any): void;
  onStudentLike(payload: any): void;
  onStudentAnswerSelf(payload: any): void;
  onStudentAnswerAll(payload: any): void;
  onStudentSendUnity(payload: any): void;
  onStudentSetBrushstrokes(payload: any): void;
  onStudentDrawsLine(payload: any): void;
  onTeacherCreateFabricObject(payload: any): void;
  onTeacherModifyFabricObject(payload: any): void;
  onToggleAllShapes(payload: any): void;
  onToggleShape(payload: any): void;
  onHelperJoinedClass(payload: any): void;
  onHelperExitClass(payload: any): void;
  onHelperDisconnectClass(payload: any): void;
  onTeacherHideHelperVideo(payload: any): void;
  onTeacherShowHelperVideo(payload: any): void;
}
