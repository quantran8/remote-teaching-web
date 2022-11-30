// these are from RemoteTeachingHub.cs at server side
export enum TeacherWSCommand {
  STREAM_CONNECT = "TeacherStreamConnect",
  JOIN_CLASS = "TeacherJoinClass",
  MUTE_VIDEO = "TeacherMuteVideo",
  MUTE_AUDIO = "TeacherMuteAudio",
  MUTE_STUDENT_VIDEO = "TeacherMuteStudentVideo",
  MUTE_STUDENT_AUDIO = "TeacherMuteStudentAudio",
  MUTE_ALL_STUDENT_AUDIO = "TeacherMuteAllStudentAudio",
  MUTE_ALL_STUDENT_VIDEO = "TeacherMuteAllStudentVideo",
  TOGGLE_STUDENTS_PALETTES = "ToggleStudentsPalettes",
  RESET_PALETTE_ALL_STUDENT = "ResetPaletteAllStudent",
  SET_STUDENT_PALETTE = "SetStudentPalette",
  SET_TEACHING_MODE = "TeacherSetTeachingMode",
  END_CLASS = "TeacherEndClass",
  SET_STUDENT_BADGE = "TeacherSetStudentBadge",
  ADD_STUDENT_AUDIO = "TeacherAddStudentAudio",
  CLEAR_STUDENT_AUDIO = "TeacherClearStudentAudio",
  ADD_GLOBAL_STUDENT_AUDIO = "TeacherAddGlobalStudentAudio",
  CLEAR_GLOBAL_STUDENT_AUDIO = "TeacherClearGlobalStudentAudio",
  START_LESSON_CONTENT = "TeacherSetContent",
  END_LESSON_CONTENT = "TeacherEndContent",
  SET_LESSON_ITEM_CONTENT = "TeacherSetItemContent",
  BLACKOUT_LESSON_CONTENT = "BlackOutScreen",
  CLEAR_RAISING_HAND = "TeacherClearRaisingHand",
  SET_CLASS_ACTION = "TeacherSetClassAction",
  DESIGNATE_TARGET = "TeacherDesignate",
  TEACHER_ANSWER_INTERACTIVE = "TeacherAnswerInteractive",
  TEACHER_ANSWER_ALL = "TeacherAnswerAllTarget",
  TEACHER_SET_POINTER = "TeacherSetPointer",
  TEACHER_UPDATE_ANNOTATION_MODE = "TeacherUpdateAnnotationMode",
  TEACHER_CLEAR_ALL_BRUSH_STROKES = "TeacherClearAllBrushstrokes",
  TEACHER_UNDO_BRUSH = "TeacherUndoBrushs",
  TEACHER_SET_STICKERS = "TeacherSetStickers",
  TEACHER_CLEAR_STICKERS = "TeacherClearStickers",
  // TEACHER_ACTION_GAME = "TeacherActionGame",
  TEACHER_SET_ONE_TO_ONE = "TeacherSetOneToOne",
  TEACHER_SET_WHITEBOARD = "TeacherSetWhiteBoard",
  TEACHER_DRAW_LASER_PEN = "TeacherDrawLaserPen",
  TEACHER_DRAW_PENCIL_PEN = "TeacherDrawPencilPen",
  TEACHER_CREATE_FABRIC_OBJECT = "TeacherCreateFabricObject",
  TEACHER_MODIFY_FABRIC_OBJECT = "TeacherModifyFabricObject",

  TOGGLE_ALL_SHAPES = "ToggleAllShapes",
  TOGGLE_SHAPE = "ToggleShape",
  CHECK_MESSAGE_VERSION = "TeacherCheckMessageVersion",
  UPDATE_SESSION_LESSON_AND_UNIT = "TeacherUpdateSessionLessonAndUnit",

  TEACHER_RESET_ZOOM = "TeacherResetZoom",
  TEACHER_ZOOM_SLIDE = "TeacherZoomSlide",
  TEACHER_MOVE_ZOOMED_SLIDE = "TeacherMoveZoomedSlide",
  TEACHER_SEND_REQUEST_CAPTURE_IMAGE = "TeacherSendRequestCaptureImage",
  TEACHER_SET_MEDIA_STATE = "TeacherSetMediaState",
  TEACHER_SET_CURRENT_TIME_MEDIA = "SetCurrentTimeMedia",
}
