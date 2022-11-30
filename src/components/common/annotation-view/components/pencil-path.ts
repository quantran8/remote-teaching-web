import { StudentState } from "@/store/room/interface";
import { fabric } from "fabric";

export const pencilPen = (
  pencilPath: Array<any>,
  canvas: any,
  studentOneAndOneId: string,
  student: StudentState,
  originZoomRatio: number,
  zoomRatioByTeacher: number,
) => {
  if (pencilPath.length) {
    if (!studentOneAndOneId || studentOneAndOneId === student.id) {
      const pencilLines = canvas.getObjects().filter((obj: any) => obj.id === "pencil");
      if (pencilPath.length >= pencilLines.length) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => (obj.id === "pencil" && !obj.isDone) || (obj.id === "pencil" && obj.ratio === zoomRatioByTeacher)),
        );
      } else {
        const lastLine = pencilLines[pencilLines.length - 1];
        canvas.remove(
          ...pencilLines.filter(
            (obj: any) => (obj.lineIdRelated && obj.lineIdRelated === lastLine.lineIdRelated) || obj.lineId === lastLine.lineIdRelated,
          ),
          lastLine,
        );
        return;
      }

      const canvasViewPortX = Math.abs(canvas.viewportTransform[4]);
      const canvasViewPortY = Math.abs(canvas.viewportTransform[5]);
      const zoom = canvas.getZoom();
      pencilPath.forEach((data: any) => {
        if (data.ratio === zoomRatioByTeacher) {
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
            item.isDone = data.isDone;
            item.ratio = data.ratio;
            item.lineId = data.id;
            item.lineIdRelated = data.lineIdRelated;
            canvas.add(item);
          });
        }
      });
    }
  }
};
