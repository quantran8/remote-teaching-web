import { DefaultCanvasDimension, starPolygonPoints } from "commonui";
import { fabric } from "fabric";

export const annotationCurriculum = () => {
  const addAnnotationLesson = (propImage: any, item: any, canvas: any) => {
    let imgWidthCropFit, imgHeightCropFit;
    const objectFitCenter = 50;
    const xMetadata = propImage.metaData.x;
    const yMetadata = propImage.metaData.y;
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
    // 0: rect, 1: circle, 2: star
    let rect, circle, star, points;
    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          left: (item.x - xMetadata) * ratio + imgLeftCrop,
          top: (item.y - yMetadata) * ratio,
          width: item.width * ratio,
          height: item.height * ratio,
          fill: "",
          stroke: item.color,
          strokeWidth: 5,
          id: "annotation-lesson",
        });
        rect.rotate(item.rotate);
        canvas.add(rect);
        break;
      case (item.type = 1):
        circle = new fabric.Circle({
          left: (item.x - xMetadata) * ratio + imgLeftCrop,
          top: (item.y - yMetadata) * ratio,
          radius: (item.width / 2) * ratio,
          fill: "",
          stroke: item.color,
          strokeWidth: 5,
          id: "annotation-lesson",
        });
        canvas.add(circle);
        break;
      case (item.type = 2):
        points = starPolygonPoints(5, (item.width / 2) * ratio, (item.width / 4) * ratio);
        star = new fabric.Polygon(points, {
          stroke: item.color,
          left: (item.x - xMetadata) * ratio + imgLeftCrop,
          top: (item.y - yMetadata) * ratio,
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
  const processAnnotationLesson = (propImage: any, canvas: any) => {
    if (!canvas) return;
    if (!propImage) return;
    const annotations = propImage.metaData?.annotations;
    if (annotations && annotations.length) {
      annotations.forEach((item: any) => {
        addAnnotationLesson(propImage, item, canvas);
      });
    } else {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
    }
  };
  return {
    processAnnotationLesson,
  };
};
