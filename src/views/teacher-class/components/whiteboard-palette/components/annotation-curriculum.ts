import { DefaultCanvasDimension, ratioValue, starPolygonPoints, setStrokeColor } from "commonui";
import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";

export const annotationCurriculum = () => {
  const { dispatch, getters } = useStore();
  const isTeacher = computed(() => getters["teacherRoom/teacher"]);
  const toggleTargetTeacher = (event: any, visible: boolean) => {
    dispatch("teacherRoom/setTargetsVisibleListAction", {
      userId: isTeacher.value.id,
      tag: event.tag,
      visible: visible,
    });
  };
  const eventSelfClick = (event: any, tagObject: any, canvas: any, item: any) => {
    if (event !== null && event.tag === tagObject.tag && event.id === "annotation-lesson") {
      if (event.stroke === "transparent") {
        setStrokeColor(canvas, event, item.color);
        toggleTargetTeacher(event, true);
      } else {
        setStrokeColor(canvas, event, "transparent");
        toggleTargetTeacher(event, false);
      }
    }
  };
  const eventStudentClick = (event: any, tagObject: any, canvas: any, item: any) => {
    if (event !== null && event.tag === tagObject.tag && event.visible && event.id !== "annotation-lesson") {
      setStrokeColor(canvas, tagObject, item.color);
    }
    if (event !== null && event.tag === tagObject.tag && !event.visible && event.id !== "annotation-lesson") {
      setStrokeColor(canvas, tagObject, "transparent");
    }
  };
  const processShape = (bindAll: any, event: any, tagObject: any, canvas: any, item: any, shape: any) => {
    if (!bindAll) {
      eventSelfClick(event, tagObject, canvas, item);
      eventStudentClick(event, tagObject, canvas, item);
    } else {
      if (event === "show-all-targets") {
        toggleTargetTeacher(tagObject, true);
      } else if (event === "hide-all-targets") {
        toggleTargetTeacher(tagObject, false);
      } else {
        canvas.add(shape);
      }
    }
  };
  const addAnnotationLesson = (propImage: any, item: any, canvas: any, bindAll: boolean, event: any) => {
    const { imgLeftCrop, ratio } = ratioValue(propImage, DefaultCanvasDimension.width, DefaultCanvasDimension.height);
    const xMetadata = propImage.metaData.x;
    const yMetadata = propImage.metaData.y;
    const xShape = (item.x - xMetadata) * ratio + imgLeftCrop;
    const yShape = (item.y - yMetadata) * ratio;
    // 0: rect, 1: circle, 2: star
    let rect, circle, star, points, tagObject;
    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          left: xShape,
          top: yShape,
          width: item.width * ratio,
          height: item.height * ratio,
          fill: "rgba(255,255,255,0.01)",
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        rect.rotate(item.rotate);
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, rect);
        break;
      case (item.type = 1):
        circle = new fabric.Circle({
          left: xShape,
          top: yShape,
          radius: (item.width / 2) * ratio,
          fill: "rgba(255,255,255,0.01)",
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, circle);
        break;
      case (item.type = 2):
        points = starPolygonPoints(5, (item.width / 2) * ratio, (item.width / 4) * ratio);
        star = new fabric.Polygon(points, {
          stroke: "transparent",
          left: xShape,
          top: yShape,
          strokeWidth: 5,
          strokeLineJoin: "round",
          fill: "rgba(255,255,255,0.01)",
          id: "annotation-lesson",
          tag: "star-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
        });
        star.rotate(item.rotate);
        tagObject = { tag: "star-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, star);
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
