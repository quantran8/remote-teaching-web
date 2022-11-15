import { fabric } from "fabric";
import { StudentState } from "@/store/room/interface";

export const pencilPen = (pencilPath: Array<any>, canvas: any, studentOneAndOneId: string, student: StudentState, originZoomRatio: number) => {
  if (pencilPath.length) {
    if (!studentOneAndOneId || studentOneAndOneId === student.id) {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "pencil"));
      const canvasViewPortX = Math.abs(canvas.viewportTransform[4]);
      const canvasViewPortY = Math.abs(canvas.viewportTransform[5]);
      const zoom = canvas.getZoom();
      pencilPath.forEach((data: any) => {
        const points = data.points.map((point: any) => ({
          x: (point.x / zoom) * originZoomRatio + canvasViewPortX / zoom,
          y: (point.y / zoom) * originZoomRatio + canvasViewPortY / zoom,
        }));
        new fabric.Polyline.fromObject({ points }, (item: any) => {
          item.id = "pencil";
          item.fill = "transparent";
          item.stroke = data.strokeColor;
          item.strokeWidth = data.strokeWidth;
          item.selectable = false;
          canvas.add(item);
        });
      });
    }
  }
};
