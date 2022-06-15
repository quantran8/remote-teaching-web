import { DefaultCanvasDimension, ratioValue, setStrokeColor, getRadius, getScaleX, getScaleY } from "@/utils/utils";
import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";

const DEFAUL_FILL = "rgba(255,255,255,0.01)";
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
    const xMetadata = propImage.metaData.x;
    const yMetadata = propImage.metaData.y;
    const imgWidth = getters["teacherRoom/imgWidth"];
    const imgHeight = getters["teacherRoom/imgHeight"];
    const { imgLeftCrop, ratio } = ratioValue(propImage, imgWidth, imgHeight, DefaultCanvasDimension.width, DefaultCanvasDimension.height);
    const xShape = (item.x - xMetadata) * ratio + imgLeftCrop;
    const yShape = (item.y - yMetadata) * ratio;
    // 0: rect, 1: circle
    let rect, circle, tagObject;
    const commonProps = {
      originX: "center",
      originY: "center",
      strokeUniform: true,
      fill: DEFAUL_FILL,
      left: xShape,
      top: yShape,
      realFill: item.fill,
      realOpacity: item.opacity,
      stroke: "transparent",
      strokeWidth: 5 * ratio,
      id: "annotation-lesson",
      perPixelTargetFind: true,
    };
    switch (item.type) {
      case (item.type = 0): {
        rect = new fabric.Rect({
          width: item.width * ratio,
          height: item.height * ratio,
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        rect.rotate(item.rotate);
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, rect);
        break;
      }
      case (item.type = 1): {
        circle = new fabric.Circle({
          radius: getRadius(item.width * ratio, item.height * ratio),
          scaleX: getScaleX(item.width * ratio, item.height * ratio),
          scaleY: getScaleY(item.width * ratio, item.height * ratio),
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        circle.rotate(item.rotate);
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, circle);
        break;
      }
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
