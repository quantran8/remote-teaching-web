export enum TeacherWSEvent {
  JOIN_CLASS = "1203",
  STREAM_CONNECT = "1204",
  MUTE_AUDIO = "1205",
  MUTE_VIDEO = "1206",
  MUTE_STUDENT_AUDIO = "1207",
  MUTE_STUDENT_VIDEO = "1208",
  MUTE_AUDIO_ALL_STUDENT = "1209",
  MUTE_VIDEO_ALL_STUDENT = "1210",
  END_CLASS = "1211",
  DISCONNECT = "1300",
  SET_FOCUS_TAB = "1212",
  UPDATE_GLOBAL_AUDIO = "1200",
  UPDATE_LOCAL_AUDIO = "1201",
  UPDATE_STUDENT_BADGE = "1202",
  UPDATE_BLACK_OUT = "1114",

  START_LESSON_PLAN = "1115",
  END_LESSON_PLAN = "1116",
  SET_ITEM_CONTENT_LESSON_PLAN = "1117",
  CLEAR_RAISING_HAND = "1112",
  UPDATE_LESSON_ACTION = "1113",
  DESIGNATE_INTERACTIVE = "1111",
  UPDATE_INTERACTIVE = "1110",
  EVENT_STUDENT_UPDATE_ANSWER_LIST = "2100",
  EVENT_UPDATE_POINTER = "1108",
  EVENT_ANNOTATION_UPDATE_MODE = "1105",
  EVENT_TEACHER_ANNOTATION_ADD_BRUSHSTROKE = "1107",
  EVENT_TEACHER_ANNOTATION_UPDATE_BRUSHS = "1104",
  EVENT_TEACHER_ANNOTATION_SET_BRUSHSTROKE = "1103",
  EVENT_TEACHER_ANNOTATION_CLEAR_BRUSHSTROKE = "1106",
  EVENT_TEACHER_ANNOTATION_DELETE_BRUSHSTROKE = "1102",
  EVENT_TEACHER_ANNOTATION_SET_STICKER = "1101",
  EVENT_TEACHER_ANNOTATION_CLEAR_STICKER = "1100",
  EVENT_TEACHER_SEND_UNITY = "1400",
  EVENT_TEACHER_SET_ONE_TO_ONE = "1213",
}
