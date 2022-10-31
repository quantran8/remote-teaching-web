import { fabric } from "fabric";
import {DefaultCanvasDimension, getRadius, getScaleX, getScaleY, ratioValue, setStrokeColor} from "@/utils/utils";
import { useStore } from "vuex";
import { computed } from "vue";

export const annotationCurriculumStudent = () => {
  const { dispatch, getters } = useStore();
  const student = computed(() => getters["studentRoom/student"]);
  const targetsList = computed(() => getters["lesson/targetsAnnotationList"]);
  const isImgProcessing = computed(() => getters["annotation/isImgProcessing"]);
  const studentOneAndOneId = computed(() => getters["studentRoom/getStudentModeOneId"]);
  const isPaletteVisible = computed(
	() => (student.value?.isPalette && !studentOneAndOneId.value) || (student.value?.isPalette && student.value?.id == studentOneAndOneId.value),
  );
  const zoomRatio = computed(() => getters["lesson/zoomRatio"]);
  const imgCoords = computed(() => getters["lesson/imgCoords"]);
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
      const target = targetsList.value.find((a: any) => a.tag === tagObject.tag);
      if (event === "show-all-targets" || event === 'show-all-targets-first-time' || (target && target.visible)) {
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
	  angle:item.rotate,
      realFill: item.fill,
      realOpacity: item.opacity,
      stroke: "transparent",
      strokeWidth: 5 * ratio,
      id: "annotation-lesson",
      perPixelTargetFind: true,
    };

    switch (item.type) {
      case (item.type = 0):
        rect = new fabric.Rect({
          width: item.width * ratio,
          height: item.height * ratio,
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
		if(group && event === 'show-all-targets-first-time'){
			group.addWithUpdate(rect)
		}
        processShape(bindAll, event, tagObject, canvas, item, group);
        return rect;
      case (item.type = 1):
        circle = new fabric.Ellipse({
          radius: getRadius(item.width * ratio, item.height * ratio),
		  rx: (item.width / 2) * ratio,
          ry: (item.height / 2) * ratio,
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
		if(group && event === 'show-all-targets-first-time'){
			group.addWithUpdate(circle)
		}
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
	const uniqueAnnotations: any[] = []; 
	annotations?.forEach((metaDataObj: any) => {
		if(!uniqueAnnotations.some((_obj: any) => 
		metaDataObj.color === _obj.color 
		&& metaDataObj.height === _obj.height 
		&& metaDataObj.width === _obj.width 
		&& metaDataObj.opacity === _obj.opacity 
		&& metaDataObj.rotate === _obj.rotate 
		&& metaDataObj.type === _obj.type 
		&& metaDataObj.x === _obj.x 
		&& metaDataObj.y === _obj.y 
		)){
			uniqueAnnotations.push(metaDataObj);
		}
	});
    if (uniqueAnnotations && uniqueAnnotations.length && !isShowWhiteBoard.value) {
	  if(!isImgProcessing.value){
		uniqueAnnotations.forEach((item: any) => {
			const shape = addAnnotationLesson(canvas, propImage, item, bindAll, event, group);
			allShape.push(shape);
		  });
	  } 
	}else {
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

  const processLessonImage = (
	propImage: any, 
	canvas: any,
	imgEl: any, 
	containerRef: any , 
	isShowWhiteBoard: boolean, 
	visible: boolean, 
	point: any,
	canvasZoomRatio: number,
	firstLoad: boolean
	) => {
	if(!propImage?.url){
		return;
	}
	const event = visible ? 'show-all-targets-first-time' : 'hide-all-targets'
	const imgWidth = getters["annotation/imgWidth"];
	const imgHeight = getters["annotation/imgHeight"];
	const annotation = propImage?.metaData?.annotations;
	const canvasGroup = canvas.getObjects().find((item:any) => item.id === 'lesson-img');
	const imageRatio = Math.max(
		imgWidth / DefaultCanvasDimension.width,
		imgHeight / DefaultCanvasDimension.height,
	  );
	  const renderWidth = imgWidth / imageRatio;
	  const renderHeight = imgHeight / imageRatio;
	   dispatch("annotation/setImgRenderSize", { width: renderWidth, height: renderHeight },);
	  if(canvasGroup){
		canvas.remove(canvasGroup)
	}
	const clipPath = new fabric.Rect({
		width:renderWidth,
		height:renderHeight,
		left:(DefaultCanvasDimension.width - renderWidth) / 2,
		top:0,
		absolutePositioned: true ,
	})
	const angle = propImage.metaData ?((propImage.metaData.width > 0 && propImage.metaData.height > 0) ? 0 : propImage.metaData.rotate) : 0
	const Image = new fabric.Image(imgEl,{
		id:'lesson-img',
		clipPath,
		originX:'center',
		originY:'center',
		angle,
		selectable:true,
		hasBorders:false,
		hasControls:false

	});
	Image.scaleToWidth(renderWidth)
	Image.scaleToHeight(renderHeight);
	const left = imgCoords.value?.x ?? DefaultCanvasDimension.width /2;
	const top = imgCoords.value?.y ?? renderHeight /2;
	const Group = new fabric.Group([Image],{
		id:'lesson-img',
		clipPath,
		originX:'center',
		originY:'center',
		left,
		top,
		selectable:isPaletteVisible.value,
		visible:!isShowWhiteBoard,
		hoverCursor: "pointer",
		scaleX:propImage?.metaData?.scaleX ?? 1,
		scaleY:propImage?.metaData?.scaleY ?? 1,
		hasBorders:false,
		hasControls:false,
		layout: 'clip-path',
		interactive: true,
		subTargetCheck: true,
		lockMovementX:true,
		lockMovementY:true,

	});
	if(annotation && annotation.length){
		const data =  processAnnotationLesson(
			canvas,
			propImage,
			containerRef,
			isShowWhiteBoard,
			true,
			event,
			Group
		  );
		if(event === 'hide-all-targets'){
			data?.forEach((item:any) => {
				Group.addWithUpdate(item);
			});
		}
	}
	if(!isImgProcessing.value){
		if(top !== Group.top){
			Group.realTop = Group.top;
		}
		if(left !== Group.left){
			Group.realLeft = Group.left;
		}
		canvas.add(Group);
		canvas.sendToBack(Group);
		if(zoomRatio.value > 1 && firstLoad){
			canvas.zoomToPoint(point, canvasZoomRatio + (zoomRatio.value - 1)*canvasZoomRatio);
		}
	}
	return Group
  };
  return {
    processAnnotationLesson,
	processLessonImage
  };
};
