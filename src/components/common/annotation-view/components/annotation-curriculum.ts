import { fabric } from "fabric";
import { ratioValue, setStrokeColor } from "@/utils/utils";
import { useStore } from "vuex";
import { computed } from "vue";

export const annotationCurriculumStudent = () => {
  const { dispatch, getters } = useStore();
  const student = computed(() => getters["studentRoom/student"]);
  const targetsList = computed(() => getters["lesson/targetsAnnotationList"]);
  const toggleTargetStudent = (event: any, visible: boolean) => {
    dispatch("studentRoom/setTargetsVisibleListAction", {
      userId: student.value.id,
      tag: event.tag,
      visible: visible,
    });
  };
  const eventStudentClick = (event: any, tagObject: any, canvas: any, item: any) => {
    if (event !== null && event.tag === tagObject.tag && event.id === "annotation-lesson") {
      if (event.stroke === "transparent") {
        setStrokeColor(canvas, event, item.color);
        toggleTargetStudent(event, true);
      } else {
        setStrokeColor(canvas, event, "transparent");
        toggleTargetStudent(event, false);
      }
    }
  };
  const eventTeacherClick = (event: any, tagObject: any, canvas: any, item: any) => {
    if (
      (event !== null && event === "show-all-targets") ||
      (event !== null && event.tag === tagObject.tag && event.visible && event.id !== "annotation-lesson")
    ) {
      setStrokeColor(canvas, tagObject, item.color);
    }
    if (
      (event !== null && event === "hide-all-targets") ||
      (event !== null && event.tag === tagObject.tag && !event.visible && event.id !== "annotation-lesson")
    ) {
      setStrokeColor(canvas, tagObject, "transparent");
    }
  };
  const processShape = (bindAll: any, event: any, tagObject: any, canvas: any, item: any, shape: any) => {
    if (!bindAll) {
      eventStudentClick(event, tagObject, canvas, item);
      eventTeacherClick(event, tagObject, canvas, item);
    } else if (!canvas.getObjects().some((obj: any) => obj.tag === tagObject.tag)) {
      canvas.add(shape);
      const target = targetsList.value.find((a: any) => a.tag === tagObject.tag);
      if (event === "show-all-targets" || (target && target.visible)) {
        setStrokeColor(canvas, tagObject, item.color);
      } else if (event === "hide-all-targets") {
        setStrokeColor(canvas, tagObject, "transparent");
      }
    }
  };
  const addAnnotationLesson = (
    canvas: any,
    propImage: any,
    item: any,
    widthCanvas: number,
    heightCanvas: number,
    zoom: number,
    bindAll: boolean,
    event: any,
  ) => {
    const xMetadata = propImage.metaData?.x;
    const yMetadata = propImage.metaData?.y;
    const imgWidth = getters["annotation/imgWidth"];
    const imgHeight = getters["annotation/imgHeight"];
    const { imgLeftCrop, ratio } = ratioValue(propImage, imgWidth, imgHeight, widthCanvas, heightCanvas);
    const xShape = ((item.x - xMetadata) * ratio + imgLeftCrop) / zoom;
    const yShape = ((item.y - yMetadata) * ratio) / zoom;
    // 0: rect, 1: circle
    let rect, circle, points, tagObject;
    const commonProps = {
      originX: "center",
      originY: "center",
    };
    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          left: xShape,
          top: yShape,
          width: (item.width / zoom) * ratio,
          height: (item.height / zoom) * ratio,
          fill: "rgba(255,255,255,0.01)",
          realFill: item.fill,
          realOpacity: item.opacity,
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
          ...commonProps,
        });
        rect.rotate(item.rotate);
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, rect);
        break;
      case (item.type = 1):
        circle = new fabric.Circle({
          left: xShape,
          top: yShape,
          radius: (item.width / 2 / zoom) * ratio,
          fill: "rgba(255,255,255,0.01)",
          realFill: item.fill,
          realOpacity: item.opacity,
          stroke: "transparent",
          strokeWidth: 5,
          id: "annotation-lesson",
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          perPixelTargetFind: true,
          ...commonProps,
        });
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, circle);
        break;
    }
  };
  const processAnnotationLesson = (canvas: any, propImage: any, containerRef: any, isShowWhiteBoard: any, bindAll: boolean, event: any) => {
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
        addAnnotationLesson(canvas, propImage, item, containerWidth, containerWidth / ratio, zoom, bindAll, event);
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
