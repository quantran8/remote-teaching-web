import { fabric } from "fabric";

export const laserPen = (laserPath: any, canvas: any, oneOneStatus: any, studentOneAndOneId: any, student: any) => {
  if (laserPath.value) {
    if (!studentOneAndOneId.value || studentOneAndOneId.value === student.value.id) {
      laserPath.value.lines.forEach((data: any) => {
        const laserPathLine = new fabric.Polyline.fromObject({ points: data.points }, (item: any) => {
          item.fill = "transparent";
          item.stroke = data.strokeColor;
          item.strokeWidth = data.strokeWidth;
          canvas.add(item);
          item.animate("opacity", `0`, {
            duration: 1000,
            easing: fabric.util.ease.easeInOutExpo,
            onComplete: async () => {
              if (laserPath.value.isDone) {
                canvas.remove(item);
              }
            },
          });
        });
      });
    }
  }
};
