export enum TeacherWSCommand {
  STREAM_CONNECT = "TeacherStreamConnect",
  JOIN_CLASS = "TeacherJoinClass",
  MUTE_VIDEO = "TeacherMuteVideo",
  MUTE_AUDIO = "TeacherMuteAudio",
  MUTE_STUDENT_VIDEO = "TeacherMuteStudentVideo",
  MUTE_STUDENT_AUDIO = "TeacherMuteStudentAudio",
  MUTE_ALL_STUDENT_AUDIO = "TeacherMuteAllStudentAudio",
  MUTE_ALL_STUDENT_VIDEO = "TeacherMuteAllStudentVideo",
  SET_FOCUS_TAB = "TeacherSetFocusTab",
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
  TEACHER_ADD_BRUSH_STROKES = "TeacherAddBrushstrokes",
  TEACHER_SET_BRUSH_STROKES = "TeacherSetBrushstrokes",
  TEACHER_CLEAR_ALL_BRUSH_STROKES = "TeacherClearAllBrushstrokes",
  TEACHER_UNDO_BRUSH = "TeacherUndoBrushs",
  TEACHER_SET_STICKERS = "TeacherSetStickers",
  TEACHER_CLEAR_STICKERS = "TeacherClearStickers",
  TEACHER_ACTION_GAME = "TeacherActionGame",
  TEACHER_SET_ONE_TO_ONE = "TeacherSetOneToOne",
}
