import { fabric } from "fabric";

export const laserPen = (laserPath: any, canvas: any, oneOneStatus: any, studentOneAndOneId: any, student: any, originZoomRatio: number) => {
  if (laserPath.value) {
    const laserPathLine = canvas.getObjects().find((obj: any) => obj.id === "laser");
    if (laserPath.value.isDone && laserPathLine) {
      setTimeout(() => {
        canvas.remove(laserPathLine);
      }, 1000);
    } else {
      if (!studentOneAndOneId.value || studentOneAndOneId.value === student.value.id) {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "laser"));
        const canvasViewPortX = Math.abs(canvas.viewportTransform[4]);
        const canvasViewPortY = Math.abs(canvas.viewportTransform[5]);
        const zoom = canvas.getZoom();
        laserPath.value.lines.forEach((data: any) => {
          const points = data.points.map((point: any) => ({
            x: (point.x / zoom) * originZoomRatio + canvasViewPortX / zoom,
            y: (point.y / zoom) * originZoomRatio + canvasViewPortY / zoom,
          }));
          new fabric.Polyline.fromObject({ points }, (item: any) => {
            item.id = "laser";
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
  }
};
