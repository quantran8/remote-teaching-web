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
  onTeacherSetTeachingMode(payload: any): void;
  onTeacherUpdateGlobalAudio(payload: any): void;
  onTeacherUpdateLocalAudio(payload: any): void;
  onTeacherUpdateStudentBadge(payload: any): void;
  onTeacherUpdateBlackOut(payload: any): void;
  onTeacherStartLessonPlan(payload: any): void;
  onTeacherEndLessonPlan(payload: any): void;
  onTeacherSetLessonPlanItemContent(payload: any): void;
  onTeacherClearRaisingHand(payload: any): void;
  onTeacherUpdateClassAction(payload: any): void;
  onTeacherDesignateTarget(payload: any): void;
  onTeacherUpdateDesignateTarget(payload: any): void;
  onTeacherSetPointer(payload: any): void;
  onTeacherUpdateAnnotationMode(payload: any): void;
  onTeacherAddBrush(payload: any): void;
  onTeacherClearAllBrush(payload: any): void;
  onTeacherDeleteBrush(payload: any): void;
  onTeacherSetStickers(payload: any): void;
  onTeacherClearStickers(payload: any): void;
  onStudentUpdateAnswers(payload: any): void;
  // onTeacherSendUnity(payload: any): void;
  onTeacherSetOneToOne(payload: any): void;
  onTeacherSetWhiteboard(payload: any): void;
  onTeacherDrawLaser(payload: any): void;
  onTeacherDisableAllStudentPallete(payload: any): void;
  onTeacherToggleStudentPallete(payload: any): void;
  onTeacherAddShape(payload: any): void;
  onTeacherCreateFabricObject(payload: any): void;
  onTeacherModifyFabricObject(payload: any): void;
  onToggleAllShapes(payload: any): void;
  onTeacherZoomSlide(payload: any): void;
  onTeacherMoveZoomedSlide(payload: any): void;
  onTeacherResetZoom(payload: any): void;
  onTeacherDrawPencil(payload: any): void;

  onTeacherUpdateSessionLessonAndUnit(payload: any): void;
  onTeacherSendRequestCaptureImage(payload: any): void;
  onStudentSendCapturedImageStatus(payload: any): void;
  onTeacherSetMediaState(payload: any): void;
  onTeacherSetCurrentTimeMedia(payload: any): void;
  onTeacherResetPaletteAllStudent(payload: any): void;
  onTeacherDeleteFabric(payload: any): void;
  onTeacherDeleteShape(payload: any): void;
} 
