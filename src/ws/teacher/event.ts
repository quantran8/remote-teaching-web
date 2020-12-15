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
}
