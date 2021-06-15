import { Howl } from "howler";

const audioGenerator = (path: string, loop = false) =>
  new Howl({
    src: [require(`@/assets/audio/disconnection${path}`)],
    loop,
  });

export const reconnectFailedSound = audioGenerator("/reconnect-failed.mp3");

export const reconnectSuccessSound = audioGenerator("/reconnect-success.mp3");

export const teacherTryReconnectSound = audioGenerator("/teacher-try-reconnect.mp3", true);

export const tryReconnectLoop2 = audioGenerator("/try-reconnect-loop-2.mp3");

export const watchStory = audioGenerator("/watch-story.mp3");

export const canGoToClassRoomToday = audioGenerator("/can-go-to-classroom-today.mp3")

export const pleaseWaitTeacher = audioGenerator("/please-wait-teacher.mp3");