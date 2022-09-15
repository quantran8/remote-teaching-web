import { fabric } from "fabric";
import {DefaultCanvasDimension, getRadius, getScaleX, getScaleY, ratioValue, setStrokeColor} from "@/utils/utils";
import { useStore } from "vuex";
import { computed } from "vue";

export const annotationCurriculumStudent = () => {
  const { dispatch, getters } = useStore();
  const student = computed(() => getters["studentRoom/student"]);
  const targetsList = computed(() => getters["lesson/targetsAnnotationList"]);
  const isImgProcessing = computed(() => getters["annotation/isImgProcessing"]);
  const toggleTargetStudent = (event: any, visible: boolean) => {
    dispatch("studentRoom/setTargetsVisibleListAction", {
      userId: student.value.id,
      tag: event.tag,
      visible: visible,
    });
  };
  const eventStudentClick = (event: any, tagObject: any, canvas: any, item: any, group: any) => {
    if (event !== null && event.tag === tagObject.tag && event.id === "annotation-lesson") {
      if (event.stroke === "transparent") {
        setStrokeColor(canvas, event, item.color,group);
        toggleTargetStudent(event, true);
      } else {
        setStrokeColor(canvas, event, "transparent",group);
        toggleTargetStudent(event, false);
      }
    }
  };
  const eventTeacherClick = (event: any, tagObject: any, canvas: any, item: any, group: any) => {
    if (
      (event !== null && event === "show-all-targets") ||
      (event !== null && event.tag === tagObject.tag && event.visible && event.id !== "annotation-lesson")
    ) {
      setStrokeColor(canvas, tagObject, item.color,group);
    }
    if (
      (event !== null && event === "hide-all-targets") ||
      (event !== null && event.tag === tagObject.tag && !event.visible && event.id !== "annotation-lesson")
    ) {
      setStrokeColor(canvas, tagObject, "transparent",group);
    }
  };
  const processShape = (bindAll: any, event: any, tagObject: any, canvas: any, item: any, group: any) => {
    if (!bindAll) {
      eventStudentClick(event, tagObject, canvas, item,group);
      eventTeacherClick(event, tagObject, canvas, item,group);
    } else if (!canvas.getObjects().some((obj: any) => obj.tag === tagObject.tag)) {
    //   canvas.add(shape);
      const target = targetsList.value.find((a: any) => a.tag === tagObject.tag);
      if (event === "show-all-targets" || (target && target.visible)) {
        setStrokeColor(canvas, tagObject, item.color,group);
      } else if (event === "hide-all-targets") {
        setStrokeColor(canvas, tagObject, "transparent",group);
      }
   }
  };
  const addAnnotationLesson = (
    canvas: any,
    propImage: any,
    item: any,
    bindAll: boolean,
    event: any,
	group: any
  ) => {
    const xMetadata = propImage.metaData?.x;
    const yMetadata = propImage.metaData?.y;
    const imgWidth = getters["annotation/imgWidth"];
    const imgHeight = getters["annotation/imgHeight"];
	const rotation = propImage.metaData?.rotate;
	const ratioWidth = rotation && (rotation / 90) % 2  ? imgHeight : imgWidth
	const ratioHeight = rotation && (rotation / 90) % 2  ? imgWidth : imgHeight
    const { imgLeftCrop, ratio } = ratioValue(propImage, ratioWidth, ratioHeight, DefaultCanvasDimension.width, DefaultCanvasDimension.height);
    const xShape = ((item.x - xMetadata) * ratio + imgLeftCrop);
    const yShape = ((item.y - yMetadata) * ratio);
    // 0: rect, 1: circle
    let rect, circle,tagObject;
    const commonProps = {
      originX: "center",
      originY: "center",
      fill: "rgba(255,255,255,0.01)",
      left: xShape,
      top: yShape,
      realFill: item.fill,
      realOpacity: item.opacity,
      stroke: "transparent",
      strokeWidth: 5 * ratio,
      id: "annotation-lesson",
      perPixelTargetFind: true,
    };

	const imageRatio = Math.max(imgWidth / DefaultCanvasDimension.width, imgHeight / DefaultCanvasDimension.height);
	const max = imgWidth / DefaultCanvasDimension.width === imageRatio ? "x" : "y";
	const renderWidth = imgWidth / imageRatio;
	const renderHeight = imgHeight / imageRatio;

	const clip = {
		x: Math.round((DefaultCanvasDimension.width - renderWidth) / 2),
		y: 0,
		width: Math.round(renderWidth),
		height: Math.round(renderHeight),
		max,
	};

	const clipPath = new fabric.Rect({
		width: clip.width,
		height: clip.height,
		top: clip.max === "x" ? clip.y - commonProps.top : -item.height * ratio,
		left: clip.max === "y" ? clip.x - commonProps.left : -item.height * ratio,
	});

    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          width: item.width * ratio,
          height: item.height * ratio,
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        rect.rotate(item.rotate);
		// rect.clipPath = clipPath;
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, group);
        return rect;
      case (item.type = 1):
        circle = new fabric.Circle({
          radius: getRadius(item.width * ratio, item.height * ratio),
          scaleX: getScaleX(item.width * ratio, item.height * ratio),
          scaleY: getScaleY(item.width * ratio, item.height * ratio),
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        circle.rotate(item.rotate);
		// circle.clipPath = clipPath;
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
        processShape(bindAll, event, tagObject, canvas, item, group);
        return circle;
    }
  };
  const processAnnotationLesson = (canvas: any, propImage: any, containerRef: any, isShowWhiteBoard: any, bindAll: boolean, event: any,group: any) => {
	if (!canvas) return;
    if (!propImage) return;
	const allShape :any[] = [];
    const outerCanvasContainer = containerRef.value;
    if (!outerCanvasContainer) return;
    const annotations = propImage.metaData?.annotations;
    if (annotations && annotations.length && !isShowWhiteBoard.value) {
	  if(!isImgProcessing.value){
		annotations.forEach((item: any) => {
			const shape = addAnnotationLesson(canvas, propImage, item, bindAll, event, group);
			allShape.push(shape);
		  });
	  };
    } else {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
    }
    canvas.getObjects().forEach((obj: any) => {
      if (obj.id === "annotation-lesson" && obj.id !== 'lesson-img') {
        obj.selectable = false;
        obj.hasControls = false;
        obj.hasBorders = false;
        obj.hoverCursor = "cursor";
      }
    });
	return allShape;
  };

  const processLessonImage = (propImage: any, canvas: any,imgEl: any, containerRef: any , isShowWhiteBoard: boolean, visible: boolean) => {
	const imgWidth = getters["annotation/imgWidth"];
	const imgHeight = getters["annotation/imgHeight"];
	const annotation = propImage.image?.metaData?.annotations;
	const canvasGroup = canvas.getObjects().find((item:any) => item.id === 'lesson-img');
	const imageRatio = Math.max(
		imgWidth / DefaultCanvasDimension.width,
		imgHeight / DefaultCanvasDimension.height,
	  );
	  const renderWidth = imgWidth / imageRatio;
	  const renderHeight = imgHeight / imageRatio;
	if(!propImage.image?.url){
		return;
	}
	// if(canvasGroup){
	// 	canvas.remove(canvasGroup)
	// }
	const clipPath = new fabric.Rect({
		width:renderWidth,
		height:renderHeight,
		left:(DefaultCanvasDimension.width - renderWidth) / 2,
		top:0,
		absolutePositioned: true ,
	})
	const angle = propImage.image.metaData ?((propImage.image.metaData.width > 0 && propImage.image.metaData.height > 0) ? 0 : propImage.image.metaData.rotate) : 0
	const Image = new fabric.Image(imgEl,{
		id:'lesson-img',
		clipPath,
		originX:'center',
		originY:'center',
		angle,
		left:DefaultCanvasDimension.width /2,
		top:DefaultCanvasDimension.height /2,
		selectable:true,
		hasBorders:false,
		hasControls:false

	});
	Image.scaleToWidth(DefaultCanvasDimension.width)
	Image.scaleToHeight(DefaultCanvasDimension.height);
	const Group = new fabric.Group([Image],{
		id:'lesson-img',
		clipPath,
		originX:'center',
		originY:'center',
		left:DefaultCanvasDimension.width /2,
		top:DefaultCanvasDimension.height /2,
		selectable:true,
		hoverCursor: "pointer",
		scaleX:propImage.image?.metaData?.scaleX ?? 1,
		scaleY:propImage.image?.metaData?.scaleY ?? 1,
		hasBorders:false,
		hasControls:false,
		layout: 'clip-path',
		interactive: true,
		subTargetCheck: true,
		// lockMovementX:true,
		// lockMovementY:true

	});
	if(annotation && annotation.length){
		const data =  processAnnotationLesson(
			canvas,
			propImage.image,
			containerRef,
			isShowWhiteBoard,
			true,
			visible ? "show-all-targets" : "hide-all-targets",
			Group
		  );
		data?.forEach((item:any) => {
			Group.addWithUpdate(item);
		})
	}
	// console.log(canvasGroup)
	// if(!canvasGroup)
	canvas.add(Group);




	return Group
  };
  return {
    processAnnotationLesson,
	processLessonImage
  };
};
