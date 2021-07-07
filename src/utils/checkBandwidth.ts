import { RemoteTeachingService } from "@/services";

export const checkBandwidth = async (studentId?: string) => {
  setInterval(() => {
    bandWidthSpeed.measure(function(speedMbps: any) {
      if (studentId) {
        RemoteTeachingService.putStudentBandwidth(studentId, Math.round(speedMbps).toString());
      } else {
        RemoteTeachingService.putTeacherBandwidth(Math.round(speedMbps).toString());
      }
      console.log(speedMbps);
    });
  }, 300000); //300000 = 5 minutes;
};

const bandWidthSpeed = {
  downloadSize: 1500000, //1MB

  measure: function(cb: any) {
    const image = new Image();
    let endTime: any;

    image.onload = function() {
      endTime = new Date().getTime();
      const speedKbps = bandWidthSpeed.calculate(startTime, endTime);
      cb(speedKbps);
    };

    image.onerror = function(err, msg) {
      console.log("Invalid image, or error downloading");
    };

    const startTime = new Date().getTime();
    const cacheBuster = "?nnn=" + startTime;
    image.src = "https://raw.githubusercontent.com/TruongNguyen95/images/main/bandwidth-test.jpeg" + cacheBuster;
  },

  calculate: function(startTime: any, endTime: any) {
    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = this.downloadSize * 8;
    const speedBps = +(bitsLoaded / duration).toFixed(2);
    const speedKbps = +(speedBps / 1024).toFixed(2);
    const speedMbps = +(speedKbps / 1024).toFixed(2);
    return Math.round(speedMbps);
  },
};
