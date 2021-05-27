import { Howl } from "howler";

const audioGenerator = (path: string, loop = false) =>
  new Howl({
    src: [require(`@/assets/audio/disconnection${path}`)],
    loop,
  });

export const reconnectFailedSound = audioGenerator("/reconnect-failed.mp3");

export const reconnectSuccessSound = audioGenerator("/reconnect-success.mp3");

export const teacherTryReconnectSound = audioGenerator("/teacher-try-reconnect.mp3", true);
