import { RemoteTeachingService } from "@/services";

const imageAddr = "/img/checkBandwidthImage.png";
const downloadSize = 3444; //kb
const download = new Image();

//300000 = 5 minutes;
export const checkBandwidth = async (studentId?: string) => {
  setInterval(() => {
    const startTime = new Date().getTime();
    download.onload = function() {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = downloadSize * 8;
      const speedKbps = +(bitsLoaded / duration).toFixed(2);
      const speedMbps = +(speedKbps / 1024).toFixed(2);
      if (studentId) {
        RemoteTeachingService.putStudentBandwidth(studentId, Math.round(speedMbps).toString());
      } else {
        RemoteTeachingService.putTeacherBandwidth(Math.round(speedMbps).toString());
      }
    };
    download.src = imageAddr;
  }, 10000);
};
