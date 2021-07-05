import { RemoteTeachingService } from "@/services";

const downloadSize = 4995374; //bytes
const download = new Image();

//120000 = 2 minutes;
export const checkTeacherBandwidth = async (rootState: any, interval = 120000) => {
  setInterval(() => {
    if (!rootState.lesson.exposures[0]) return;
    const startTime = new Date().getTime();
    const imageAddr = rootState.lesson.exposures[0]?.items[0].media[0].image.url;
    const cacheBuster = "&nnn=" + startTime;
    download.src = imageAddr + cacheBuster;
    download.onload = function() {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = downloadSize * 8;
      const speedBps = +(bitsLoaded / duration).toFixed(2);
      const speedKbps = +(speedBps / 1024).toFixed(2);
      const speedMbps = +(speedKbps / 1024).toFixed(2);
      RemoteTeachingService.putTeacherBandwidth(Math.round(speedMbps).toString() + " Mbps");
    };
  }, interval);
};

export const checkStudentBandwidth = async (rootState: any, studentId: string, interval = 120000) => {
  setInterval(() => {
    if (!rootState.lesson.exposures[0]) return;
    const startTime = new Date().getTime();
    const imageAddr = rootState.lesson.exposures[0]?.items[0].media[0].image.url;
    const cacheBuster = "&nnn=" + startTime;
    download.src = imageAddr + cacheBuster;
    download.onload = function() {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = downloadSize * 8;
      const speedBps = +(bitsLoaded / duration).toFixed(2);
      const speedKbps = +(speedBps / 1024).toFixed(2);
      const speedMbps = +(speedKbps / 1024).toFixed(2);
      RemoteTeachingService.putStudentBandwidth(studentId, Math.round(speedMbps).toString() + " Mbps");
    };
  }, interval);
};
