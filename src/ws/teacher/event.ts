export enum TeacherWSEvent {
  JOIN_CLASS = "EVENT_TEACHER_JOIN_CLASS",
  STREAM_CONNECT = "EVENT_TEACHER_STREAM_CONNECT",
  MUTE_AUDIO = "EVENT_TEACHER_MUTE_AUDIO",
  MUTE_VIDEO = "EVENT_TEACHER_MUTE_VIDEO",
  MUTE_STUDENT_AUDIO = "EVENT_TEACHER_MUTE_AUDIO_STUDENT",
  MUTE_STUDENT_VIDEO = "EVENT_TEACHER_MUTE_VIDEO_STUDENT",
  MUTE_AUDIO_ALL_STUDENT = "EVENT_TEACHER_MUTE_AUDIO_ALL_STUDENT",
  MUTE_VIDEO_ALL_STUDENT = "EVENT_TEACHER_MUTE_VIDEO_ALL_STUDENT",
  END_CLASS = "EVENT_TEACHER_END_CLASS",
  DISCONNECT = "EVENT_TEACHER_DISCONNECT",
  SET_FOCUS_TAB = "EVENT_SET_FOCUS_TAB",
  UPDATE_GLOBAL_AUDIO = "EVENT_UPDATE_GLOBAL_STUDENT_AUDIO",
  UPDATE_LOCAL_AUDIO = "EVENT_UPDATE_STUDENT_AUDIO",
  UPDATE_STUDENT_BADGE = "EVENT_UPDATE_STUDENT_BADGE",
  UPDATE_BLACK_OUT = "EVENT_TEACHER_UPDATE_BLACK_OUT",

  START_LESSON_PLAN = "EVENT_TEACHER_START_LESSON_PLAN",
  END_LESSON_PLAN = "EVENT_TEACHER_END_LESSON_PLAN",
  SET_ITEM_CONTENT_LESSON_PLAN = "EVENT_TEACHER_SET_ITEM_CONTENT_LESSON_PLAN",
  CLEAR_RAISING_HAND = "EVENT_STUDENT_CLEAR_RAISING_HAND",
  UPDATE_LESSON_ACTION = "EVENT_TEACHER_UPDATE_LESSON_ACTION",
  DESIGNATE_INTERACTIVE = "EVENT_TEACHER_DESIGNATE_INTERACTIVE",
  UPDATE_INTERACTIVE = "EVENT_TEACHER_UPDATE_INTERACTIVE",
  EVENT_STUDENT_UPDATE_ANSWER_LIST = "EVENT_STUDENT_UPDATE_ANSWER_LIST",
  EVENT_UPDATE_POINTER = "EVENT_TEACHER_ANNOTATION_UPDATE_POINTER",
  EVENT_ANNOTATION_UPDATE_MODE = "EVENT_TEACHER_ANNOTATION_UPDATE_MODE",
  EVENT_TEACHER_ANNOTATION_ADD_BRUSHSTROKE = "EVENT_TEACHER_ANNOTATION_ADD_BRUSHSTROKE"
}
