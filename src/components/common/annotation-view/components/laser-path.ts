import { fabric } from "fabric";

export const laserPen = (laserPath: any, canvas: any, oneOneStatus: any, studentOneAndOneId: any, student: any) => {
  if (laserPath.value) {
    const laserPathLine = new fabric.Path.fromObject(JSON.parse(laserPath.value), (item: any) => {
      item.animate("opacity", "0", {
        duration: 1000,
        easing: fabric.util.ease.easeInOutExpo,
        onChange: () => {
          if (oneOneStatus.value) {
            if (studentOneAndOneId.value === student.value.id) {
              canvas.add(item);
            }
          } else {
            canvas.add(item);
          }
        },
        onComplete: async () => {
          canvas.remove(item);
        },
      });
    });
  }
};
