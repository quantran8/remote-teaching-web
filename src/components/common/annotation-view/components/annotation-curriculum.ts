import { fabric } from "fabric";
import { starPolygonPoints } from "commonui";

export const annotationCurriculumStudent = () => {
  const addAnnotationLesson = (canvas: any, propImage: any, item: any, widthCanvas: number, heightCanvas: number, zoom: number) => {
    let imgWidthCropFit, imgHeightCropFit;
    const objectFitCenter = 50;
    const xMetadata = propImage.metaData?.x;
    const yMetadata = propImage.metaData?.y;
    let widthMetadata, heightMetadata;
    if (propImage.metaData.width === 0 && propImage.metaData.height === 0) {
      widthMetadata = propImage.width;
      heightMetadata = propImage.height;
    } else {
      widthMetadata = propImage.metaData.width;
      heightMetadata = propImage.metaData.height;
    }
    const cropRatio = widthMetadata / heightMetadata;
    const canvasRatio = widthCanvas / heightCanvas;
    if (cropRatio > canvasRatio) {
      imgWidthCropFit = widthCanvas;
      imgHeightCropFit = widthCanvas / cropRatio;
    } else {
      imgWidthCropFit = heightCanvas * cropRatio;
      imgHeightCropFit = heightCanvas;
    }
    const imgLeftCrop = (widthCanvas - imgWidthCropFit) * (objectFitCenter / 100);
    const wRatio = imgWidthCropFit / widthMetadata;
    const hRatio = imgHeightCropFit / heightMetadata;
    const ratio = Math.min(wRatio, hRatio);
    // 0: rect, 1: circle, 2: star
    let rect, circle, star, points;
    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          left: ((item.x - xMetadata) * ratio + imgLeftCrop) / zoom,
          top: ((item.y - yMetadata) * ratio) / zoom,
          width: (item.width / zoom) * ratio,
          height: (item.height / zoom) * ratio,
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
          left: ((item.x - xMetadata) * ratio + imgLeftCrop) / zoom,
          top: ((item.y - yMetadata) * ratio) / zoom,
          radius: (item.width / 2 / zoom) * ratio,
          fill: "",
          stroke: item.color,
          strokeWidth: 5,
          id: "annotation-lesson",
        });
        canvas.add(circle);
        break;
      case (item.type = 2):
        points = starPolygonPoints(5, (item.width / 2 / zoom) * ratio, (item.width / 4 / zoom) * ratio);
        star = new fabric.Polygon(points, {
          stroke: item.color,
          left: ((item.x - xMetadata) * ratio + imgLeftCrop) / zoom,
          top: ((item.y - yMetadata) * ratio) / zoom,
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
  const processAnnotationLesson = (canvas: any, propImage: any, containerRef: any, isShowWhiteBoard: any) => {
    if (!canvas) return;
    if (!propImage) return;
    const outerCanvasContainer = containerRef.value;
    if (!outerCanvasContainer) return;
    const ratio = canvas.getWidth() / canvas.getHeight();
    const containerWidth = outerCanvasContainer.clientWidth;
    const scale = containerWidth / canvas.getWidth();
    const zoom = canvas.getZoom() * scale;
    const annotations = propImage.metaData?.annotations;
    if (annotations && annotations.length && !isShowWhiteBoard.value) {
      annotations.forEach((item: any) => {
        addAnnotationLesson(canvas, propImage, item, containerWidth, containerWidth / ratio, zoom);
      });
    } else {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
    }
  };
  return {
    processAnnotationLesson,
  };
};
