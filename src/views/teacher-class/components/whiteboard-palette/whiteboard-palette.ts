import { computed, ComputedRef, defineComponent, onMounted, Ref, ref, watch, onUnmounted } from "vue";
import { useStore } from "vuex";
import { gsap } from "gsap";
import { fabric } from "fabric";
import { Tools, Mode, DefaultCanvasDimension } from "@/utils/utils";
import { onClickOutside } from "@vueuse/core";
import ToolsCanvas from "@/components/common/annotation/tools/tools-canvas.vue";
import { ClassView } from "@/store/room/interface";
import { useFabricObject } from "@/hooks/use-fabric-object";
import { FabricObject } from "@/ws";
import { fmtMsg } from "vue-glcommonui";
import { TeacherClass, WhiteBoard } from "@/locales/localeid";
import { addShape } from "@/views/teacher-class/components/whiteboard-palette/components/add-shape";
import { brushstrokesRender } from "@/components/common/annotation-view/components/brush-strokes";
import { annotationCurriculum } from "@/views/teacher-class/components/whiteboard-palette/components/annotation-curriculum";
import { Button, Space } from "ant-design-vue";
import { Pointer } from "@/store/annotation/state";

const DEFAULT_COLOR = "black";
const DEFAULT_STYLE ={
	width:'100%',
	transform:'scale(1,1) rotate(0deg)',
}
export enum Cursor {
  Default = "default",
  Text = "text",
}

export default defineComponent({
  props: {
    image: Object,
    id: String,
    name: String,
    isGalleryView: Boolean,
  },
  components: {
    ToolsCanvas,
    Space,
    Button,
  },
  setup(props) {
    const store = useStore();
    const currentExposureItemMedia: ComputedRef = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const isLessonPlan = computed(() => store.getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const infoTeacher = computed(() => store.getters["teacherRoom/info"]);
    const isTeacher = computed(() => store.getters["teacherRoom/teacher"]);
    const oneAndOne = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);
    const studentShapes = computed(() => store.getters["annotation/studentShape"]);
    const studentStrokes = computed(() => store.getters["annotation/studentStrokes"]);
    const oneOneTeacherStrokes = computed(() => store.getters["annotation/oneOneTeacherStrokes"]);
    const oneOneStudentStrokes = computed(() => store.getters["annotation/oneOneStudentStrokes"]);
    const oneStudentShape = computed(() => store.getters["annotation/oneStudentShape"]);
    const selfShapes = computed(() => store.getters["annotation/teacherShape"]);
    const selfStrokes = computed(() => store.getters["annotation/shapes"]);
    const isShowWhiteBoard = computed(() => store.getters["teacherRoom/isShowWhiteBoard"]);
 
	let canvas: any;
    const tools = Tools;
    const wrapCanvasRef = ref<any>(null);
    const toolNames: string[] = Object.values(tools);
    const styles = ref(DEFAULT_STYLE);
    const toolSelected: Ref<string> = ref("cursor");
    const strokeColor: Ref<string> = ref(DEFAULT_COLOR);
    const strokeWidth: Ref<number> = ref(2);
    const modeAnnotation: Ref<number> = ref(-1);
	const showHideWhiteboard: Ref<boolean> = ref(isShowWhiteBoard.value);
    const firstLoadImage: Ref<boolean> = ref(false);
    const firstTimeLoadStrokes: Ref<boolean> = ref(false);
    const firstTimeLoadShapes: Ref<boolean> = ref(false);

	const isDrawing: Ref<boolean> = ref(false);
	const prevPoint: Ref<Pointer|undefined> = ref(undefined)
	const isMouseOver: Ref<boolean> = ref(false);
	const isMouseOut: Ref<boolean> = ref(false);


    const studentDisconnected = computed<boolean>(() => store.getters["studentRoom/isDisconnected"]);
    const teacherDisconnected = computed<boolean>(() => store.getters["teacherRoom/isDisconnected"]);
    const { createTextBox, onTextBoxEdited, onObjectModified, displayFabricItems, isEditing, onObjectCreated, nextColor, handleUpdateColor } =
      useFabricObject();
    nextColor.value = strokeColor.value;

	const generateLineId = () => {
		return 'line-'+Math.floor(Math.random()*10000)
	}
	const lineId: Ref<string> = ref(generateLineId())

    watch(currentExposureItemMedia, (currentItem, prevItem) => {
	  if(currentItem){
		let width ='100%'
		if(currentItem.image.metaData && currentItem.image.metaData.rotate && (Math.abs(currentItem.image.metaData.rotate) === 270 || Math.abs(currentItem.image.metaData.rotate)=== 90)){
			//if img is rotated, width equal to height of the whiteboard
			width = '435px';
		}
		styles.value = {
			width,
			transform:`scale(${currentItem.image.metaData?.scaleX ?? 1},${currentItem.image.metaData?.scaleY ?? 1}) rotate(${currentItem.image.metaData?.rotate ?? 0}deg)`,
		}
	  }
      if (currentItem && prevItem) {
		
        if (currentItem.id !== prevItem.id) {			
          canvas.remove(...canvas.getObjects());
        }
      }
    });
    watch(teacherDisconnected, (currentValue) => {
      if (currentValue) {
        firstTimeLoadStrokes.value = false;
        return;
      }
    });
    watch(studentDisconnected, (currentValue) => {
      if (currentValue) {
        firstTimeLoadStrokes.value = false;
        return;
      }
    });
    const { teacherAddShapes, addCircle, addSquare } = addShape();
    const { processAnnotationLesson } = annotationCurriculum();
    const targetsNum = computed(() => {
      return props.image?.metaData?.annotations?.length || 0;
    });
    const hasTargets = computed(() => {
      return !!props.image?.metaData.annotations && targetsNum.value;
    });
    const targetTextLocalize = computed(() => fmtMsg(TeacherClass.TargetText));
    const targetsTextLocalize = computed(() => fmtMsg(TeacherClass.TargetsText));
    const targetText = computed(() => {
      if (props.image?.metaData.annotations.length == 1) {
        return targetTextLocalize.value;
      } else {
        return targetsTextLocalize.value;
      }
    });
    const showAllTargetTextBtn = computed(() => fmtMsg(TeacherClass.ShowAllTargets));
    const disableShowAllTargetsBtn: Ref<boolean> = ref(false);
    const showAllTargets = async () => {
      processAnnotationLesson(props.image, canvas, true, "show-all-targets");
      disableShowAllTargetsBtn.value = true;
      disableHideAllTargetsBtn.value = false;
      // await store.dispatch("teacherRoom/setTargetsVisibleAllAction", {
      //   userId: isTeacher.value.id,
      //   visible: true,
      // });
    };
    const hideAllTargetTextBtn = computed(() => fmtMsg(TeacherClass.HideAllTargets));
    const disableHideAllTargetsBtn: Ref<boolean> = ref(true);
    const hideAllTargets = async () => {
      processAnnotationLesson(props.image, canvas, true, "hide-all-targets");
      disableHideAllTargetsBtn.value = true;
      disableShowAllTargetsBtn.value = false;
      // await store.dispatch("teacherRoom/setTargetsVisibleAllAction", {
      //   userId: isTeacher.value.id,
      //   visible: false,
      // });
    };
    const objectTargetOnCanvas = () => {
      if (!canvas) return;
      const objShow = canvas
        .getObjects()
        .filter((obj: any) => obj.id === "annotation-lesson")
        .filter((obj: any) => obj.stroke !== "transparent");
      disableShowAllTargetsBtn.value = objShow.length === targetsNum.value;
      const objHide = canvas
        .getObjects()
        .filter((obj: any) => obj.id === "annotation-lesson")
        .filter((obj: any) => obj.stroke === "transparent");
      disableHideAllTargetsBtn.value = objHide.length === targetsNum.value;
    };
    const targetsList = computed(() => store.getters["lesson/targetsAnnotationList"]);
    const prevTargetsList:Ref<any[]> = ref([])
	const processTargetsList =  async () => {
        if (targetsList.value?.length) {
          targetsList.value.forEach((obj: any) => {
            processAnnotationLesson(props.image, canvas, false, obj);
          });
          const objShow = targetsList.value.filter((obj: any) => obj.visible === true);
          disableShowAllTargetsBtn.value = objShow.length === targetsNum.value;
          if (objShow.length === targetsNum.value) {
            await store.dispatch("teacherRoom/setTargetsVisibleAllAction", {
              userId: isTeacher.value.id,
              visible: true,
            });
          }
          const objHide = targetsList.value.filter((obj: any) => obj.visible === false);
          disableHideAllTargetsBtn.value = objHide.length === targetsNum.value;
          if (objHide.length === targetsNum.value) {
            await store.dispatch("teacherRoom/setTargetsVisibleAllAction", {
              userId: isTeacher.value.id,
              visible: false,
            });
          }
        }
      }
    watch(targetsList,processTargetsList,{ deep: true });
    const setCursorMode = async () => {
      modeAnnotation.value = Mode.Cursor;
      await store.dispatch("teacherRoom/setMode", {
        mode: modeAnnotation.value,
      });
    };
    const setDrawMode = async () => {
      modeAnnotation.value = Mode.Draw;
      await store.dispatch("teacherRoom/setMode", {
        mode: modeAnnotation.value,
      });
    };
    // watch whiteboard state to display
    watch(infoTeacher, async () => {
      if (infoTeacher.value) {
        if (!canvas) return;
        if (infoTeacher.value.isShowWhiteBoard) {
          canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
          await clickedTool(Tools.Pen);
        } else {
          canvas.remove(...canvas.getObjects("path"));
          canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
          await clickedTool(Tools.Cursor);
        }
      }
    });
    const processCanvasWhiteboard = async (shouldResetClickedTool = true) => {
      if (!canvas) return;
      showHideWhiteboard.value = isShowWhiteBoard.value;
      if (isShowWhiteBoard.value) {
        // canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
        canvas
          .getObjects()
          .filter((obj: any) => obj.id === "annotation-lesson")
          .forEach((obj: any) => {
            obj.set("visible", false);
          });
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
		if(shouldResetClickedTool){
        	await clickedTool(Tools.Pen);
		}
      } else {
        canvas.remove(...canvas.getObjects("path"));
        canvas.remove(...canvas.getObjects("textbox"));
        canvas
          .getObjects()
          .filter((obj: any) => obj.id === "annotation-lesson")
          .forEach((obj: any) => {
            obj.set("visible", true);
          });
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
        // await clickedTool(Tools.Cursor);
      }
    };
    watch(isShowWhiteBoard, async () => {
      await processCanvasWhiteboard(false);
      // if (!isShowWhiteBoard.value) {
      //   processAnnotationLesson(props.image, canvas, true, null);
      // }
    });
	const imageUrl = computed(() => {
		const image = new Image();
		image.onload = imgLoad;
		image.src = props.image ? props.image.url : {};
		return image.src;
	  });
    const cursorPosition = async (e: any , isDone = false ) => {
		const rect = document.getElementById("canvas-container");
        if (!rect) return;
        const rectBounding = rect.getBoundingClientRect();
        let x = e.clientX - rectBounding.left;
        let y = e.clientY - rectBounding.top;
		const windowWidth = window.innerWidth;
		const scaleRatio = 0.68;
		const scaleBreakpoint = 1600;

		// when windowWidth is equal or below scaleBreakpoints, the whiteboard would be scaled down by the scaleRatio
		// so, we need to adjust the coordinates back to their original value (before scaled) for them to be displayed correctly on student's view
		if (windowWidth <= scaleBreakpoint) {
			x = x / scaleRatio;
			y = y / scaleRatio;
		}
      if (modeAnnotation.value === Mode.Cursor) {
        await store.dispatch("teacherRoom/setPointer", {
          x: Math.floor(x),
          y: Math.floor(y),
        });
		return;
      }
	  if(toolSelected.value === Tools.Laser && isDrawing.value){
		const _point = { 
			x: Math.floor(x),
			y: Math.floor(y),
		}
		if(!prevPoint.value){
			prevPoint.value = _point;
		}
		else{
			const absX = Math.abs(_point.x - prevPoint.value.x)
			const absY = Math.abs(_point.y - prevPoint.value.y)
		if((absX > 8 || absY > 8) || isDone)
		{
			prevPoint.value = _point;
			if(isMouseOut.value && isMouseOver.value){
				lineId.value = generateLineId()
				await store.dispatch("teacherRoom/setLaserPath", {
					data:{
						id:lineId.value,
						points:_point,
						strokeColor:strokeColor.value,
						strokeWidth:strokeWidth.value
					},
					isDone
				});
				isMouseOver.value = false;
				isMouseOut.value = false;
				prevPoint.value = undefined
			}
			else{
				await store.dispatch("teacherRoom/setLaserPath", {
					data:{
						id:lineId.value,
						points:_point,
						strokeColor:strokeColor.value,
						strokeWidth:strokeWidth.value
					},
					isDone
				});
			}
			return;
		}
		}
	  }
	  
    };
    const objectsCanvas = async () => {
      const teacherStrokes = canvas.getObjects("path").filter((obj: any) => obj.id === isTeacher.value.id);
      const lastObject = teacherStrokes[teacherStrokes.length - 1];
      if (toolSelected.value === Tools.Pen) {
        await store.dispatch("teacherRoom/setBrush", {
          drawing: lastObject,
        });
      }
      if (toolSelected.value === Tools.Laser) {
        // await store.dispatch("teacherRoom/setLaserPath", {point,isDone});

      }
    };
    const laserDraw = () => {
      const laserPath = canvas.getObjects("path").pop();
      laserPath.animate("opacity", "0", {
        duration: 1000,
        easing: fabric.util.ease.easeInOutExpo,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => {
          canvas.remove(laserPath);
        },
      });
    };
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async (event:any) => {
        if (toolSelected.value === "pen") {
          canvas.renderAll();
          await objectsCanvas();
        }
        if (toolSelected.value === Tools.Laser) {
		  cursorPosition(event.e,true)
		  isDrawing.value = false;
		  prevPoint.value = undefined;
          canvas.renderAll();
          laserDraw();
        }
        if (
          toolSelected.value === Tools.Circle ||
          toolSelected.value === Tools.Square ||
          toolSelected.value === Tools.Cursor ||
          toolSelected.value === Tools.TextBox
        ) {
          if (canvas.getActiveObject()?.type !== "textbox") {
            await teacherAddShapes(canvas);
          }
        }
      });
    };
	const listenToMouseOut = () => {
		canvas.on("mouse:out", async (event:any) => {
			if(isDrawing.value){
				isMouseOut.value = true;
			}
		});
	  };
	  const listenToMouseOver = () => {
		canvas.on("mouse:over", async (event:any) => {
			if(isDrawing.value){
				isMouseOver.value = true;
			}
		});
	  };
    const listenCreatedPath = () => {
      canvas.on("path:created", (obj: any) => {
        obj.path.id = isTeacher.value.id;
        obj.path.isOneToOne = oneAndOne.value || null;
      });
    };
    const listenSelfTeacher = () => {
      canvas
        .getObjects()
        .filter((obj: any) => obj.type !== "path")
        .filter((obj: any) => obj.id === isTeacher.value.id)
        .forEach((item: any) => {
          item.selectable = true;
        });
    };
    const listenMouseEvent = () => {
      //handle mouse:move
      canvas.on("mouse:move", (event: any) => {
        switch (toolSelected.value) {
          //handle for TextBox
          case Tools.TextBox: {
            if (!event.target || event.target.type === "path") {
              canvas.setCursor(Cursor.Text);
              canvas.renderAll();
            }
            break;
          }
          default:
            break;
        }
      });
      //handle mouse:down
      canvas.on("mouse:down", (event: any) => {
        processAnnotationLesson(props.image, canvas, false, event.target);
        switch (toolSelected.value) {
          //handle for TextBox
          case Tools.TextBox: {
            if (event.target && event.target.type !== "path") {
              isEditing.value = true;
              break;
            }
            if (!isEditing.value) {
              createTextBox(canvas, { top: event.e.offsetY - 2, left: event.e.offsetX - 2 });
            } else {
              isEditing.value = false;	
            }
            break;
          }
		  case Tools.Laser : {
			  isDrawing.value = true;
			  break;
		  }
          default:
            break;
        }
      });
    };
    watch(toolSelected, (tool, prevTool) => {
      if (prevTool !== tool) {
        canvas.discardActiveObject();
        canvas.renderAll();
        isEditing.value = false;
      }
    });
    // LISTENING TO CANVAS EVENTS
    const listenToCanvasEvents = () => {
      listenToMouseUp();
	  listenToMouseOut();
	  listenToMouseOver();
      listenCreatedPath();
      listenSelfTeacher();
      onObjectModified(canvas);
      onTextBoxEdited(canvas);
      listenMouseEvent();
      onObjectCreated(canvas);
    };
    const boardSetup = async () => {
      const canvasEl = document.getElementById("canvasDesignate");
      canvas = new fabric.Canvas("canvasDesignate");
      canvas.setWidth(DefaultCanvasDimension.width);
      canvas.setHeight(DefaultCanvasDimension.height);
      canvas.selectionFullyContained = false;
      await processCanvasWhiteboard();
      listenToCanvasEvents();
    };
    const objectCanvasProcess = () => {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === "path" || (obj.id !== isTeacher.value.id && !obj.objectId)) {
          obj.selectable = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.hoverCursor = "cursor";
          obj.perPixelTargetFind = true;
        }
      });
    };
    const clickedTool = async (tool: string) => {
      if (tool === Tools.StrokeColor) {
        objectCanvasProcess();
        return;
      }
      if (tool === Tools.Stroke) {
        objectCanvasProcess();
        return;
      }
      canvas.selection = false;
      canvas.isDrawingMode = tool === Tools.Pen;
      if (toolSelected.value !== tool) {
        toolSelected.value = tool;
      } else {
        if (toolSelected.value === Tools.TextBox) {
          clickedTool(Tools.Cursor);
          return;
        }
      }

      switch (tool) {
        case Tools.TextBox:
          await setDrawMode();
          return;
        case Tools.Cursor:
          toolSelected.value = Tools.Cursor;
          canvas.isDrawingMode = false;
          await setCursorMode();
          objectCanvasProcess();
          return;
        case Tools.Pen:
          toolSelected.value = Tools.Pen;
          // canvas.remove(...canvas.getObjects("rect"));
          // await store.dispatch("teacherRoom/setClearStickers", {});
          await setDrawMode();
          canvas.freeDrawingBrush.color = strokeColor.value;
          canvas.freeDrawingBrush.width = strokeWidth.value;
          objectCanvasProcess();
          return;
        case Tools.Laser:
          toolSelected.value = Tools.Laser;
          canvas.isDrawingMode = true;
          await setDrawMode();
          return;
        case Tools.Stroke:
          toolSelected.value = Tools.Stroke;
          objectCanvasProcess();
          return;
        case Tools.StrokeColor:
          toolSelected.value = Tools.StrokeColor;
          objectCanvasProcess();
          return;
        case Tools.Delete:
          toolSelected.value = Tools.Delete;
          if (canvas.getObjects("path").length) {
            const itemDelete = canvas
              .getObjects("path")
              .filter((item: any) => item.id === isTeacher.value.id)
              .pop();
            canvas.remove(itemDelete);
            await store.dispatch("teacherRoom/setDeleteBrush", {});
            toolSelected.value = Tools.Pen;
            canvas.isDrawingMode = true;
          } else {
            toolSelected.value = Tools.Pen;
            canvas.isDrawingMode = true;
          }
          await setDrawMode();
          return;
        case Tools.Clear:
          toolSelected.value = Tools.Clear;
          canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id !== "annotation-lesson"));
          await store.dispatch("teacherRoom/setClearBrush", {});
          toolSelected.value = Tools.Pen;
          canvas.isDrawingMode = true;
          await setDrawMode();
          return;
        case Tools.Circle:
          toolSelected.value = Tools.Circle;
          await setDrawMode();
          await addCircle(canvas, strokeColor, strokeWidth, oneAndOne);
          objectCanvasProcess();
          return;
        case Tools.Square:
          toolSelected.value = Tools.Square;
          await setDrawMode();
          await addSquare(canvas, strokeColor, strokeWidth, oneAndOne);
          objectCanvasProcess();
          return;
        default:
          return;
      }
    };
    const updateColorValue = (value: any) => {
      handleUpdateColor(canvas, value);
      strokeColor.value = value;
      canvas.freeDrawingBrush.color = value;
    };
    const updateStrokeWidth = (value: number) => {
      strokeWidth.value = value;
      canvas.freeDrawingBrush.width = value;
    };
    const showWhiteboard = async () => {
      await store.dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: true });
    //   await clickedTool(Tools.Clear);
	  await store.dispatch("teacherRoom/setClearBrush", {});
      canvas.freeDrawingBrush.color = strokeColor.value;
      canvas.freeDrawingBrush.width = strokeWidth.value;
    };
    const hideWhiteboard = async () => {
      await store.dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
      // await clickedTool(Tools.Cursor);
      // canvas.remove(...canvas.getObjects());
      await store.dispatch("teacherRoom/setClearBrush", {});
    };
    const imgLoad = async (e: Event) => {
      if (!canvas) return;
      const img = e?.target as HTMLImageElement;
      if (img && img.naturalWidth && img.naturalHeight) {
        await store.dispatch("annotation/setImgDimension", { width: img.naturalWidth, height: img.naturalHeight });
      } else {
        await store.dispatch("annotation/setImgDimension", { width: undefined, height: undefined });
      }
      if (!firstLoadImage.value) {
        firstLoadImage.value = true;
      }
      processAnnotationLesson(props.image, canvas, true, null);
      objectTargetOnCanvas();
      // showHideWhiteboard.value = isShowWhiteBoard.value;
      // if (isShowWhiteBoard.value) {
      //   canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
      //   canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      // } else {
      //   await clickedTool(Tools.Cursor);
      //   canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      // }
    };
    const defaultWhiteboard = async () => {
      await setCursorMode();
      await store.dispatch("teacherRoom/setClearBrush", {});
    };
    const renderSelfStrokes = () => {
      if (selfStrokes.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === isTeacher.value.id)
            .filter((obj: any) => obj.type === "path"),
        );
        selfStrokes.value.forEach((s: any) => {
          const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
            item.id = isTeacher.value.id;
            item.isOneToOne = null;
            canvas.add(item);
          });
        });
        objectCanvasProcess();
      }
    };
    watch(selfStrokes, async () => {
      // await nextTick();
      if (!firstTimeLoadStrokes.value && selfStrokes.value) {
        renderSelfStrokes();
        firstTimeLoadStrokes.value = true;
      } else if (selfStrokes.value.length === 0) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === isTeacher.value.id)
            .filter((obj: any) => obj.type === "path"),
        );
      }
    });
    const renderStudentsShapes = () => {
      if (!canvas && !studentShapes.value) return;
      if (studentShapes.value !== null && studentShapes.value !== undefined) {
        if (studentShapes.value.length > 0) {
          studentShapes.value.forEach((item: any) => {
            if (item.userId !== isTeacher.value.id) {
              canvas.remove(
                ...canvas
                  .getObjects()
                  .filter((obj: any) => obj.type !== "path")
                  .filter((obj: any) => obj.id === item.userId),
              );
              brushstrokesRender(canvas, item, null, "student-shapes");
            }
          });
        } else {
          canvas.remove(
            ...canvas
              .getObjects()
              .filter((obj: any) => obj.type !== "path")
              .filter((obj: any) => obj.tag === "student-shapes"),
          );
        }
      }
      if (showHideWhiteboard.value) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      }
    };
    watch(studentShapes, () => {
      renderStudentsShapes();
    });
    const renderStudentStrokes = () => {
      if (!canvas) return;
      if (studentStrokes.value && studentStrokes.value.length > 0) {
        studentStrokes.value.forEach((s: any) => {
          const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
            item.isOneToOne = null;
            item.tag = "student-strokes";
            canvas.add(item);
          });
        });
      } else {
        canvas.remove(...canvas.getObjects("path").filter((obj: any) => obj.tag === "student-strokes"));
      }
      objectCanvasProcess();
    };
    watch(studentStrokes, () => {
      renderStudentStrokes();
    });
    const renderOneStudentStrokes = () => {
      if (oneOneStudentStrokes.value && oneOneStudentStrokes.value.length > 0) {
        oneOneStudentStrokes.value.forEach((s: any) => {
          const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
            item.isOneToOne = oneAndOne.value;
            item.tag = "student-strokes-one";
            canvas.add(item);
          });
        });
        objectCanvasProcess();
      } else {
        canvas.remove(...canvas.getObjects("path").filter((obj: any) => obj.tag === "student-strokes-one"));
      }
    };
    const renderOneTeacherStrokes = () => {
      if (oneOneTeacherStrokes.value && oneOneTeacherStrokes.value.length > 0) {
        oneOneTeacherStrokes.value.forEach((s: any) => {
          const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
            item.isOneToOne = oneAndOne.value;
            item.tag = "teacher-strokes-one";
            canvas.add(item);
          });
        });
        objectCanvasProcess();
      } else {
        canvas.remove(...canvas.getObjects("path").filter((obj: any) => obj.tag === "teacher-strokes-one"));
      }
    };

    watch(oneOneTeacherStrokes, () => {
      renderOneTeacherStrokes();
    });
    watch(oneOneStudentStrokes, () => {
      renderOneStudentStrokes();
    });
    const renderOneStudentShape = () => {
      canvas.remove(
        ...canvas
          .getObjects()
          .filter((obj: any) => obj.type !== "path")
          .filter((obj: any) => obj.id !== isTeacher.value.id)
          .filter((obj: any) => obj.id === oneAndOne.value),
      );
      if (oneStudentShape.value && oneStudentShape.value.length > 0) {
        oneStudentShape.value.forEach((item: any) => {
          if (item.userId !== isTeacher.value.id) {
            brushstrokesRender(canvas, item, oneAndOne.value, "student-shapes-one");
          }
        });
      }
    };
    watch(oneStudentShape, () => {
      renderOneStudentShape();
    });
    const renderSelfShapes = () => {
      canvas.remove(
        ...canvas
          .getObjects()
          .filter((obj: any) => obj.id === isTeacher.value.id)
          .filter((obj: any) => obj.type !== "path"),
      );
      if (selfShapes.value && selfShapes.value.length > 0) {
        selfShapes.value.forEach((item: any) => {
          if (item.userId === isTeacher.value.id) {
            brushstrokesRender(canvas, item, null, "self-shapes");
          }
        });
        listenSelfTeacher();
      }
    };
    watch(selfShapes, async () => {
      if (!firstTimeLoadShapes.value && selfShapes.value) {
        renderSelfShapes();
        firstTimeLoadShapes.value = true;
      } else if (selfShapes.value && selfShapes.value.length === 0) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === isTeacher.value.id)
            .filter((obj: any) => obj.type !== "path"),
        );
      }
    });
    watch(oneAndOne, async () => {
      if (!canvas) return;
      const activeFabricObject = canvas.getActiveObject();
      if (activeFabricObject?.type === "textbox" && activeFabricObject.isEditing) {
        activeFabricObject.exitEditing();
        canvas.discardActiveObject();
        canvas.renderAll();
      } 
      if (!oneAndOne.value) {
        // remove all objects in mode 1-1
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.isOneToOne !== null));
        // render objects again before into mode 1-1
        renderStudentsShapes();
		await store.dispatch("lesson/setTargetsVisibleListJoinedAction", prevTargetsList.value, { root: true });
        // remove and render objects again of teacher, set object can move
        setTimeout(() => {
          renderSelfStrokes();
          renderSelfShapes();	 
		  processTargetsList()
        }, 800);
        await processCanvasWhiteboard();
        listenSelfTeacher();
      }
	  else{
		prevTargetsList.value = [...targetsList.value]
	  }
    });
    //get fabric items from vuex and display to whiteboard
    const fabricItems = computed(() => {
      const oneToOneUserId = store.getters["teacherRoom/getStudentModeOneId"];
      if (oneToOneUserId) {
        const fabricsOfClass: FabricObject[] = store.getters["annotation/fabricItems"];
        const fabricsOfOneMode: FabricObject[] = store.getters["annotation/fabricItemsOneToOne"];
        for (const fabricItem of fabricsOfClass) {
          const index = fabricsOfOneMode.findIndex((item: FabricObject) => item.fabricId !== fabricItem.fabricId);
          if (index > -1) {
            fabricsOfOneMode.push(fabricItem);
          }
        }
        return fabricsOfOneMode;
      }
      return store.getters["annotation/fabricItems"];
    });
    watch(
      fabricItems,
      async (value) => {
        const oneToOneUserId = store.getters["teacherRoom/getStudentModeOneId"];
        if (!oneToOneUserId) {
          await canvas.remove(...canvas.getObjects().filter((obj: any) => obj.objectId));
        }
        displayFabricItems(canvas, value);
      },
      { deep: true },
    );
    const warningMsg = computed(() => fmtMsg(WhiteBoard.TextBoxWarning));
    const warningMsgLeave = async (element: HTMLElement, done: any) => {
      await gsap.to(element, { opacity: 0, onComplete: done, duration: 0.8 });
    };

    const handleClickOutsideCanvas = (event: any) => {
      const activeFabricObject = canvas.getActiveObject();
      if (activeFabricObject?.type === "textbox" && activeFabricObject.isEditing) {
        activeFabricObject.hiddenTextarea.focus();
        activeFabricObject.enterEditing();
      }
    };

    onMounted(async () => {
      await boardSetup();
      await defaultWhiteboard();
      canvas.freeDrawingBrush.color = DEFAULT_COLOR;
    });
    onUnmounted(() => {
      canvas.dispose();
    });

    onClickOutside(wrapCanvasRef, handleClickOutsideCanvas);
    return {
      currentExposureItemMedia,
      clickedTool,
      cursorPosition,
      toolNames,
      toolSelected,
      strokeWidth,
      strokeColor,
      updateColorValue,
      updateStrokeWidth,
      showWhiteboard,
      showHideWhiteboard,
      hideWhiteboard,
      isLessonPlan,
      imageUrl,
      imgLoad,
      styles,
      warningMsg,
      warningMsgLeave,
      hasTargets,
      targetsNum,
      targetText,
      showAllTargets,
      disableShowAllTargetsBtn,
      hideAllTargets,
      disableHideAllTargetsBtn,
      showAllTargetTextBtn,
      hideAllTargetTextBtn,
      handleClickOutsideCanvas,
      wrapCanvasRef,
    };
  },
});
