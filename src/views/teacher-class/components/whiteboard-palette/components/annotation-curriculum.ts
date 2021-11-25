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
  const addAnnotationLesson = (propImage: any, item: any, canvas: any, xClick: any, yClick: any) => {
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
          fill: "",
          stroke: item.color,
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
        });
        rect.rotate(item.rotate);
        if (xClick >= 0 && yClick >= 0) {
          const containsPoint =
            xShape <= xClick && xClick <= xShape + item.width * ratio && yShape <= yClick && yClick <= yShape + item.height * ratio;
          if (containsPoint) {
            const existing = canvas.getObjects().find((obj: any) => obj.tag === "rect-" + Math.floor(item.x) + Math.floor(item.y));
            if (existing) {
              canvas.remove(...canvas.getObjects().filter((obj: any) => obj.tag === "rect-" + Math.floor(item.x) + Math.floor(item.y)));
            } else {
              canvas.add(rect);
            }
          }
        } else {
          canvas.add(rect);
        }
        break;
      case (item.type = 1):
        circle = new fabric.Circle({
          left: xShape,
          top: yShape,
          radius: (item.width / 2) * ratio,
          fill: "",
          stroke: item.color,
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
        });
        if (xClick >= 0 && yClick >= 0) {
          const radiusShape = Math.floor((item.width / 2) * ratio);
          const xCenter = xShape + radiusShape;
          const yCenter = yShape + radiusShape;
          const insideCircle = Math.sqrt((xClick - xCenter) * (xClick - xCenter) + (yClick - yCenter) * (yClick - yCenter)) < radiusShape;
          if (insideCircle) {
            const existing = canvas.getObjects().find((obj: any) => obj.tag === "circle-" + Math.floor(item.x) + Math.floor(item.y));
            if (existing) {
              canvas.remove(...canvas.getObjects().filter((obj: any) => obj.tag === "circle-" + Math.floor(item.x) + Math.floor(item.y)));
            } else {
              canvas.add(circle);
            }
          }
        } else {
          canvas.add(circle);
        }
        break;
      case (item.type = 2):
        points = starPolygonPoints(5, (item.width / 2) * ratio, (item.width / 4) * ratio);
        star = new fabric.Polygon(points, {
          stroke: item.color,
          left: xShape,
          top: yShape,
          strokeWidth: 5,
          strokeLineJoin: "round",
          fill: "",
          id: "annotation-lesson",
        });
        star.rotate(item.rotate);
        canvas.add(star);
        break;
    }
  };
  const processAnnotationLesson = (propImage: any, canvas: any, x: any, y: any) => {
    if (!canvas) return;
    if (!propImage) return;
    const annotations = propImage.metaData?.annotations;
    if (x >= 0 && y >= 0) {
      // bind each target
      if (annotations && annotations.length) {
        annotations.forEach((item: any) => {
          addAnnotationLesson(propImage, item, canvas, x, y);
        });
      }
    } else {
      // bind all targets
      if (annotations && annotations.length) {
        annotations.forEach((item: any) => {
          addAnnotationLesson(propImage, item, canvas, -1, -1);
        });
      } else {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
      }
    }
  };
  return {
    processAnnotationLesson,
  };
};
