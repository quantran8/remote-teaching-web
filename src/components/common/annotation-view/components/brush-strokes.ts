import { fabric } from "fabric";

export const brushstrokesRender = (canvas: any, data: any, oneId: any, tag: any) => {
  data.brushstrokes.forEach((s: any) => {
    const shape = JSON.parse(s);
    if (shape.type === "polygon") {
      const polygon = new fabric.Polygon.fromObject(shape, (item: any) => {
        item.isOneToOne = oneId;
        item.tag = tag;
        canvas.add(item);
        item.selectable = false;
      });
    }
    if (shape.type === "rect") {
      const rect = new fabric.Rect.fromObject(shape, (item: any) => {
        item.isOneToOne = oneId;
        item.tag = tag;
        canvas.add(item);
        item.selectable = false;
      });
    }
    if (shape.type === "circle") {
      const circle = new fabric.Circle.fromObject(shape, (item: any) => {
        item.isOneToOne = oneId;
        item.tag = tag;
        canvas.add(item);
        item.selectable = false;
      });
    }
  });
};
