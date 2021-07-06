import { RemoteTeachingService } from "@/services";

const downloadSize = 264422; //bytes
const download = new Image();

//300000 = 5 minutes;
export const checkBandwidth = async (studentId?: string) => {
  setInterval(() => {
    const startTime = new Date().getTime();
    const imageAddr = "./src/assets/images/checkBandwidthImage.png";
    const cacheBuster = "&nnn=" + startTime;
    download.onload = function() {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = downloadSize * 8;
      const speedBps = +(bitsLoaded / duration).toFixed(2);
      const speedKbps = +(speedBps / 1024).toFixed(2);
      const speedMbps = +(speedKbps / 1024).toFixed(2);
      console.log(speedMbps);
      if (studentId) {
        RemoteTeachingService.putStudentBandwidth(studentId, Math.round(speedMbps).toString());
      } else {
        RemoteTeachingService.putTeacherBandwidth(Math.round(speedMbps).toString());
      }
    };
    download.src = imageAddr + cacheBuster;
  }, 10000);
};
