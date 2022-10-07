import { DefaultCanvasDimension, ratioValue, setStrokeColor, getRadius, getScaleX, getScaleY } from "@/utils/utils";
import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";

const DEFAULT_FILL = "rgba(255,255,255,0.01)";
export const annotationCurriculum = () => {
  const { dispatch, getters } = useStore();
  const isTeacher = computed(() => getters["teacherRoom/teacher"]);
  const targetsList = computed(() => getters["lesson/targetsAnnotationList"]);
  const isImgProcessing = computed(() => getters["annotation/isImgProcessing"]);
  const zoomRatio = computed(() => getters["lesson/zoomRatio"]);
  const imgCoords = computed(() => getters["lesson/imgCoords"]);
  const isShowWhiteBoard = computed(() => getters["teacherRoom/isShowWhiteBoard"]);

  const toggleTargetTeacher = (event: any, visible: boolean) => {
    dispatch("teacherRoom/setTargetsVisibleListAction", {
      userId: isTeacher.value.id,
      tag: event.tag,
      visible: visible,
    });
  };
  const eventSelfClick = (event: any, tagObject: any, canvas: any, item: any, group:any) => {
    if (event !== null && event.tag === tagObject.tag && event.id === "annotation-lesson") {
      if (event.stroke === "transparent") {
        setStrokeColor(canvas, event, item.color,group);
        toggleTargetTeacher(event, true);
      } else {
        setStrokeColor(canvas, event, "transparent",group);
        toggleTargetTeacher(event, false);
      }
    }
  };
  const eventStudentClick = (event: any, tagObject: any, canvas: any, item: any, group: any) => {
    if (event !== null && event.tag === tagObject.tag && event.visible && event.id !== "annotation-lesson") {
      setStrokeColor(canvas, tagObject, item.color,group);
    }
    if (event !== null && event.tag === tagObject.tag && !event.visible && event.id !== "annotation-lesson") {
      setStrokeColor(canvas, tagObject, "transparent",group);
    }
  };
  const processShape = (bindAll: any, event: any, tagObject: any, canvas: any, item: any, group: any) => {
    if (!bindAll) {
      eventSelfClick(event, tagObject, canvas, item,group);
      eventStudentClick(event, tagObject, canvas, item,group);
    } else {
      if (event == "show-all-targets-first-time") {
        setStrokeColor(canvas, tagObject, item.color, group);
      } else if (event === "show-all-targets") {
        toggleTargetTeacher(tagObject, true);
      } else if (event === "hide-all-targets") {
        toggleTargetTeacher(tagObject, false);
      }
    }
  };
  const addAnnotationLesson = (propImage: any, item: any, canvas: any, bindAll: boolean, event: any,group: any) => {
    const xMetadata = propImage.metaData.x;
    const yMetadata = propImage.metaData.y;
	const imgWidth = getters["annotation/imgWidth"];
	const imgHeight = getters["annotation/imgHeight"];
	const rotation = propImage.metaData?.rotate;
	const ratioWidth = rotation && (rotation / 90) % 2  ? imgHeight : imgWidth
	const ratioHeight = rotation && (rotation / 90) % 2  ? imgWidth : imgHeight
    const { imgLeftCrop, ratio,max, renderWidth,renderHeight } = ratioValue(propImage, ratioWidth, ratioHeight, DefaultCanvasDimension.width, DefaultCanvasDimension.height);
    const xShape = (item.x - xMetadata) * ratio + imgLeftCrop;
    const yShape = (item.y - yMetadata) * ratio;
    // 0: rect, 1: circle
    let rect, circle, tagObject;
    const commonProps = {
      originX: "center",
      originY: "center",
	  angle:item.rotate,
      strokeUniform: true,
      fill: DEFAULT_FILL,
      left: xShape,
      top: yShape,
      realFill: item.fill,
      realOpacity: item.opacity,
	  color:item.color,
      stroke: "transparent",
      strokeWidth: 5 * ratio,
      id: "annotation-lesson",
      perPixelTargetFind: true,
	  selectable : false,
	  hasControls : false,
	  hasBorders : false,
	  hoverCursor : "cursor",

    };
    switch (item.type) {
      case (item.type = 0): {
        rect = new fabric.Rect({
          width: item.width * ratio,
          height: item.height * ratio,
          tag: "rect-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        tagObject = { tag: "rect-" + Math.floor(item.x) + Math.floor(item.y) };
        if (group && event === "show-all-targets-first-time") {
          group.addWithUpdate(rect);
        }
        processShape(bindAll, event, tagObject, canvas, item, group);
		return rect;
      }
      case (item.type = 1): {
        circle = new fabric.Circle({
          radius: getRadius(item.width * ratio, item.height * ratio),
          scaleX: getScaleX(item.width * ratio, item.height * ratio),
          scaleY: getScaleY(item.width * ratio, item.height * ratio),
          tag: "circle-" + Math.floor(item.x) + Math.floor(item.y),
          ...commonProps,
        });
        tagObject = { tag: "circle-" + Math.floor(item.x) + Math.floor(item.y) };
        if (group && event === "show-all-targets-first-time") {
          group.addWithUpdate(circle);
        }
        processShape(bindAll, event, tagObject, canvas, item, group);
        return circle;
      }
    }
  };
  const processAnnotationLesson = (propImage: any, canvas: any, bindAll: boolean, event: any, group: any) => {
    if (!canvas) return;
    if (!propImage) return;
	const allShape:any = [];
    const annotations = propImage.metaData?.annotations;
	const uniqueAnnotations: any[] = []; 
	annotations.forEach((metaDataObj: any) => {
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
    if (uniqueAnnotations && uniqueAnnotations.length) {
	  if(!isImgProcessing.value){
		uniqueAnnotations.forEach((item: any) => {
		  const shape = addAnnotationLesson(propImage, item, canvas, bindAll, event,group);
		  allShape.push(shape)
		  });
	  }  
    } else {
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
    }

	return allShape;
  };
  const processLessonImage = (propImage: any, canvas: any,visible: boolean, point: any, firstLoad: any, imgEl: any) => {
	const event = visible ? 'show-all-targets-first-time' : 'hide-all-targets' 
	const imgWidth = getters["annotation/imgWidth"];
	const imgHeight = getters["annotation/imgHeight"];
	const annotation = propImage.image?.metaData?.annotations;
	const canvasGroup = canvas.getObjects().find((item:any) => item?.id === 'lesson-img');
	const imageRatio = Math.max(
		imgWidth / DefaultCanvasDimension.width,
		imgHeight / DefaultCanvasDimension.height,
	  );
	  const renderWidth = imgWidth / imageRatio;
	  const renderHeight = imgHeight / imageRatio;
	 dispatch("annotation/setImgRenderSize", { width: renderWidth, height: renderHeight });

	if(!propImage.image?.url){
		return;
	}
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
	const angle = propImage.image.metaData ?((propImage.image.metaData.width > 0 && propImage.image.metaData.height > 0) ? 0 : propImage.image.metaData.rotate) : 0
	const Image = new fabric.Image(imgEl,{
		id:'lesson-img',
		originX:'center',
		originY:'center',
		angle,
		selectable:true,
		hasBorders:false,
		hasControls:false,

	});
	Image.scaleToWidth(renderWidth);
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
		selectable:true,
		hoverCursor: "pointer",
		scaleX:propImage.image?.metaData?.scaleX ?? 1,
		scaleY:propImage.image?.metaData?.scaleY ?? 1,
		hasBorders:false,
		hasControls:false,
		layout: 'clip-path',
		interactive: true,
		subTargetCheck: true,
		visible:!isShowWhiteBoard.value

	});
	if(annotation && annotation.length){
		const data = processAnnotationLesson(propImage.image, canvas, true, event,Group);
		if (event === "hide-all-targets") {
		  data?.forEach((item:any) => {
		    Group.addWithUpdate(item);
		  })
		}
	}
	if(top !== Group.top){
		Group.realTop = Group.top;
	}
	if(left !== Group.left){
		Group.realLeft = Group.left;
	}
	canvas.add(Group);
	canvas.sendToBack(Group);
	if(zoomRatio.value > 1 && firstLoad){
		canvas.zoomToPoint(point, zoomRatio.value);
	}

    return Group;
  };

  return {
    processAnnotationLesson,
    processLessonImage,
  };
};
