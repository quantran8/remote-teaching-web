import { DefaultCanvasDimension, starPolygonPoints } from "commonui";
import { fabric } from "fabric";

export const annotationCurriculum = () => {
  const ratioValue = (propImage: any) => {
    let imgWidthCropFit, imgHeightCropFit;
    const objectFitCenter = 50;
    let widthMetadata, heightMetadata;
    if (propImage.metaData.width === 0 && propImage.metaData.height === 0) {
      widthMetadata = propImage.width;
      heightMetadata = propImage.height;
    } else {
      widthMetadata = propImage.metaData.width;
      heightMetadata = propImage.metaData.height;
    }
    const cropRatio = widthMetadata / heightMetadata;
    const canvasRatio = DefaultCanvasDimension.width / DefaultCanvasDimension.height;
    if (cropRatio > canvasRatio) {
      imgWidthCropFit = DefaultCanvasDimension.width;
      imgHeightCropFit = DefaultCanvasDimension.width / cropRatio;
    } else {
      imgWidthCropFit = DefaultCanvasDimension.height * cropRatio;
      imgHeightCropFit = DefaultCanvasDimension.height;
    }
    const imgLeftCrop = (DefaultCanvasDimension.width - imgWidthCropFit) * (objectFitCenter / 100);
    const wRatio = imgWidthCropFit / widthMetadata;
    const hRatio = imgHeightCropFit / heightMetadata;
    const ratio = Math.min(wRatio, hRatio);
    return { imgLeftCrop, ratio };
  };
  const setStrokeColor = (canvas: any, event: any, color: any) => {
    canvas.getObjects().forEach((obj: any) => {
      if (obj.tag === event.tag) {
        obj.set("stroke", color);
      }
    });
    canvas.renderAll();
  };
  const addAnnotationLesson = (propImage: any, item: any, canvas: any, bindAll: boolean, event: any) => {
    const { imgLeftCrop, ratio } = ratioValue(propImage);
    const xMetadata = propImage.metaData.x;
    const yMetadata = propImage.metaData.y;
    const xShape = (item.x - xMetadata) * ratio + imgLeftCrop;
    const yShape = (item.y - yMetadata) * ratio;
    // 0: rect, 1: circle, 2: star
    let rect, circle, star, points;
    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          left: xShape,
          top: yShape,
          width: item.width * ratio,
          height: item.height * ratio,
          fill: "rgba(0,0,0,0.01)",
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        rect.rotate(item.rotate);
        if (!bindAll) {
          if (event !== null) {
            if (event.stroke === "transparent") {
              setStrokeColor(canvas, event, item.color);
            } else {
              setStrokeColor(canvas, event, "transparent");
            }
          }
        } else {
          const tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
          if (event === "show-all-targets") {
            setStrokeColor(canvas, tagObject, item.color);
          } else if (event === "hide-all-targets") {
            setStrokeColor(canvas, tagObject, "transparent");
          } else {
            canvas.add(rect);
          }
        }
        break;
      case (item.type = 1):
        circle = new fabric.Circle({
          left: xShape,
          top: yShape,
          radius: (item.width / 2) * ratio,
          fill: "rgba(0,0,0,0.01)",
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        if (!bindAll) {
          if (event !== null) {
            if (event.stroke === "transparent") {
              setStrokeColor(canvas, event, item.color);
            } else {
              setStrokeColor(canvas, event, "transparent");
            }
          }
        } else {
          const tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
          if (event === "show-all-targets") {
            setStrokeColor(canvas, tagObject, item.color);
          } else if (event === "hide-all-targets") {
            setStrokeColor(canvas, tagObject, "transparent");
          } else {
            canvas.add(circle);
          }
        }
        break;
      case (item.type = 2):
        points = starPolygonPoints(5, (item.width / 2) * ratio, (item.width / 4) * ratio);
        star = new fabric.Polygon(points, {
          stroke: "transparent",
          left: xShape,
          top: yShape,
          strokeWidth: 5,
          strokeLineJoin: "round",
          fill: "rgba(0,0,0,0.01)",
          id: "annotation-lesson",
          tag: "star-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        star.rotate(item.rotate);
        if (!bindAll) {
          if (event !== null) {
            if (event.stroke === "transparent") {
              setStrokeColor(canvas, event, item.color);
            } else {
              setStrokeColor(canvas, event, "transparent");
            }
          }
        } else {
          const tagObject = { tag: "star-" + Math.floor(item.x) + Math.floor(item.y) };
          if (event === "show-all-targets") {
            setStrokeColor(canvas, tagObject, item.color);
          } else if (event === "hide-all-targets") {
            setStrokeColor(canvas, tagObject, "transparent");
          } else {
            canvas.add(star);
          }
        }
        break;
    }
  };
  const processAnnotationLesson = (propImage: any, canvas: any, bindAll: boolean, event: any) => {
    if (!canvas) return;
    if (!propImage) return;
    const annotations = propImage.metaData?.annotations;
    if (annotations && annotations.length) {
      annotations.forEach((item: any) => {
        addAnnotationLesson(propImage, item, canvas, bindAll, event);
      });
    } else {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
    }
    canvas.getObjects().forEach((obj: any) => {
      if (obj.id === "annotation-lesson") {
        obj.selectable = false;
        obj.hasControls = false;
        obj.hasBorders = false;
        obj.hoverCursor = "cursor";
      }
    });
  };
  return {
    processAnnotationLesson,
  };
};
