import {RemoteTeachingService} from "@/services";

const imageAddr = "/img/checkBandwidthImage.jpg";
const downloadSize = 1075; //kb
const download = new Image();

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


export const checkBandwidth = async (studentId?: string) => {
    setInterval(() => {
        const startTime = new Date().getTime();
        download.onload = function () {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;
            if (duration > 0) {
                const bitsLoaded = downloadSize * 8;
                const speedKbps = +(bitsLoaded / duration);//.toFixed(2);
                const speedMbps = +(speedKbps / 1024).toFixed(2);
                if (studentId) {
                    RemoteTeachingService.putStudentBandwidth(studentId, Math.round(speedMbps).toString());
                } else {
                    RemoteTeachingService.putTeacherBandwidth(Math.round(speedMbps).toString());
                }
            }
        };
        download.src = imageAddr + "?" + uuidv4();
    }, 300000); //300000 = 5 minutes;
};
