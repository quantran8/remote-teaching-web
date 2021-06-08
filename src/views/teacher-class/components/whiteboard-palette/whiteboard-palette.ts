import { computed, ComputedRef, defineComponent, onMounted, Ref, ref, watch, onUnmounted } from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import { Tools, Mode, starPolygonPoints } from "@/commonui";
import ToolsCanvas from "@/components/common/annotation/tools/tools-canvas.vue";
import { ClassView } from "@/store/room/interface";

const DEFAULT_COLOR = "red";

export default defineComponent({
  props: ["image"],
  components: {
    ToolsCanvas,
  },
  setup(props) {
    const store = useStore();
    const currentExposureItemMedia: ComputedRef = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const isLessonPlan = computed(() => store.getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const infoTeacher = computed(() => store.getters["teacherRoom/info"]);
    const oneAndOne = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);
    const studentShapes = computed(() => store.getters["annotation/studentShape"]);
    let canvas: any;
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);
    const toolSelected: Ref<string> = ref("cursor");
    const strokeColor: Ref<string> = ref("black");
    const strokeWidth: Ref<number> = ref(2);
    const selectorOpen: Ref<boolean> = ref(false);
    const modeAnnotation: Ref<number> = ref(-1);
    const hasStickerTool: Ref<boolean> = ref(false);
    const showHideWhiteboard: Ref<boolean> = ref(false);
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
        showHideWhiteboard.value = infoTeacher.value.isShowWhiteBoard;
        if (!canvas) return;
        if (infoTeacher.value.isShowWhiteBoard) {
          canvas.backgroundColor = "white";
          await clickedTool(Tools.Pen);
          showHideWhiteboard.value = infoTeacher.value.isShowWhiteBoard;
        } else {
          canvas.remove(...canvas.getObjects("path"));
          canvas.backgroundColor = "transparent";
          await clickedTool(Tools.Cursor);
          showHideWhiteboard.value = infoTeacher.value.isShowWhiteBoard;
        }
      }
    });
    watch(oneAndOne, async () => {
      if (!canvas) return;
      if (!oneAndOne.value) {
        hideWhiteboard();
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path")
            .filter((obj: any) => obj.id !== ""),
        );
        toolSelected.value = Tools.Clear;
        canvas.remove(...canvas.getObjects("path"));
        await store.dispatch("teacherRoom/setClearBrush", {});
        toolSelected.value = Tools.Pen;
        canvas.isDrawingMode = true;
        await setDrawMode();
      }
    });
    const imageUrl = computed(() => {
      return props.image ? props.image.url : {};
    });
    const cursorPosition = async (e: any) => {
      if (modeAnnotation.value === Mode.Cursor) {
        const rect = document.getElementById("canvas-container");
        if (!rect) return;
        const rectBounding = rect.getBoundingClientRect();
        const x = e.clientX - rectBounding.left;
        const y = e.clientY - rectBounding.top;
        await store.dispatch("teacherRoom/setPointer", {
          x: Math.floor(x),
          y: Math.floor(y),
        });
      }
    };
    const objectsCanvas = async () => {
      const canvasAsJSON = canvas.toJSON();
      const lastObject = canvasAsJSON.objects[canvasAsJSON.objects.length - 1];
      if (toolSelected.value === Tools.Pen) {
        await store.dispatch("teacherRoom/setBrush", {
          drawing: lastObject,
        });
      }
      if (toolSelected.value === Tools.Laser) {
        await store.dispatch("teacherRoom/setLaserPath", lastObject);
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
    const teacherAddShapes = async () => {
      const shapes: Array<string> = [];
      canvas.getObjects().forEach((obj: any) => {
        if (obj.id === "teacher-symbol") {
          obj = obj.toJSON();
          obj.id = "teacher-symbol";
          shapes.push(JSON.stringify(obj));
        }
      });
      console.log(shapes, "ssssssssssss");
      console.log(canvas.getObjects(), "oooooooooooooooooo");
      if (shapes.length) {
        await store.dispatch("teacherRoom/setShapesForStudent", shapes);
      }
    };
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async () => {
        if (toolSelected.value === "pen") {
          canvas.renderAll();
          await objectsCanvas();
        }
        if (toolSelected.value === Tools.Laser) {
          canvas.renderAll();
          await objectsCanvas();
          laserDraw();
        }
        await teacherAddShapes();
      });
    };
    const listenCreatedPath = () => {
      canvas.on("path:created", (obj: any) => {
        obj.path.id = infoTeacher.value.id;
      });
    };
    // LISTENING TO CANVAS EVENTS
    const listenToCanvasEvents = () => {
      listenToMouseUp();
      listenCreatedPath();
    };
    const boardSetup = async () => {
      const canvasEl = document.getElementById("canvasDesignate");
      if (!canvasEl) return;
      canvas = new fabric.Canvas("canvasDesignate");
      canvas.setWidth(717);
      canvas.setHeight(435);
      canvas.selectionFullyContained = false;
      listenToCanvasEvents();
    };
    const objectCanvasProcess = () => {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === "path" || obj.id !== "teacher-symbol") {
          obj.selectable = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.hoverCursor = "cursor";
        }
      });
    };
    const addStar = async () => {
      const points = starPolygonPoints(5, 35, 15);
      const star = new fabric.Polygon(points, {
        stroke: strokeColor.value,
        left: 0,
        top: 0,
        strokeWidth: 3,
        strokeLineJoin: "round",
        fill: "",
        id: "teacher-symbol",
      });
      canvas.add(star);
      await teacherAddShapes();
    };
    const addCircle = async () => {
      const circle = new fabric.Circle({
        left: 0,
        top: 0,
        radius: 30,
        fill: "",
        stroke: strokeColor.value,
        strokeWidth: 3,
        id: "teacher-symbol",
      });
      canvas.add(circle);
      await teacherAddShapes();
    };
    const addSquare = async () => {
      const square = new fabric.Rect({
        left: 0,
        top: 0,
        width: 50,
        height: 50,
        fill: "",
        stroke: strokeColor.value,
        strokeWidth: 3,
        id: "teacher-symbol",
      });
      canvas.add(square);
      await teacherAddShapes();
    };
    const clickedTool = async (tool: string) => {
      canvas.selection = false;
      canvas.isDrawingMode = tool === Tools.Pen;

      if (toolSelected.value !== tool) {
        toolSelected.value = tool;
        selectorOpen.value = true;
      } else {
        selectorOpen.value = !selectorOpen.value;
      }

      switch (tool) {
        case Tools.Cursor:
          toolSelected.value = Tools.Cursor;
          canvas.isDrawingMode = false;
          await setCursorMode();
          objectCanvasProcess();
          return;
        case Tools.Pen:
          toolSelected.value = Tools.Pen;
          // canvas.remove(...canvas.getObjects("rect"));
          await store.dispatch("teacherRoom/setClearStickers", {});
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
            const itemDelete = canvas.getObjects("path").pop();
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
          canvas.remove(...canvas.getObjects());
          await store.dispatch("teacherRoom/setClearBrush", {});
          toolSelected.value = Tools.Pen;
          canvas.isDrawingMode = true;
          await setDrawMode();
          return;
        case Tools.Star:
          toolSelected.value = Tools.Star;
          await setDrawMode();
          await addStar();
          objectCanvasProcess();
          return;
        case Tools.Circle:
          toolSelected.value = Tools.Circle;
          await setDrawMode();
          await addCircle();
          objectCanvasProcess();
          return;
        case Tools.Square:
          toolSelected.value = Tools.Square;
          await setDrawMode();
          await addSquare();
          objectCanvasProcess();
          return;
        default:
          return;
      }
    };
    const updateColorValue = (value: any) => {
      if (toolSelected.value === Tools.StrokeColor) {
        strokeColor.value = value;
        clickedTool(Tools.Pen).then();
      }
      if (canvas.isDrawingMode) {
        canvas.freeDrawingBrush.color = strokeColor.value;
      }
    };
    const updateStrokeWidth = (value: number) => {
      strokeWidth.value = value;
      selectorOpen.value = false;
      clickedTool(Tools.Pen).then();
    };
    const showWhiteboard = async () => {
      await store.dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: true });
      showHideWhiteboard.value = true;
      await clickedTool(Tools.Clear);
      canvas.freeDrawingBrush.color = strokeColor.value;
      canvas.freeDrawingBrush.width = strokeWidth.value;
      canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
    };
    const hideWhiteboard = async () => {
      await store.dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
      showHideWhiteboard.value = false;
      await clickedTool(Tools.Cursor);
      canvas.remove(...canvas.getObjects());
      await store.dispatch("teacherRoom/setClearBrush", {});
      canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
    };
    const imgLoad = async () => {
      if (!canvas) return;
      canvas.remove(...canvas.getObjects());
      showHideWhiteboard.value = false;
      canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      await clickedTool(Tools.Cursor);
    };
    const defaultWhiteboard = async () => {
      await setCursorMode();
      await store.dispatch("teacherRoom/setClearBrush", {});
    };
    const renderStudentsShapes = () => {
      if (!canvas && !studentShapes.value) return;
      console.log(canvas.getObjects(), "ffffffffffff");
      canvas.remove(
        ...canvas
          .getObjects()
          .filter((obj: any) => obj.type !== "path")
          .filter((obj: any) => obj.id !== "teacher-symbol"),
      );
      console.log(canvas.getObjects(), "f2222222222222");
      studentShapes.value.forEach((item: any) => {
        console.log(item, "iiiiiiiiiiiii");
        console.log(infoTeacher.value.id, "idddddddddddd");
        if (item.userId !== infoTeacher.value.id) {
          item.brushstrokes.forEach((s: any) => {
            const shape = JSON.parse(s);
            if (shape.type === "polygon") {
              const polygon = new fabric.Polygon.fromObject(shape, (item: any) => {
                canvas.add(item);
                item.selectable = false;
              });
            }
            if (shape.type === "rect") {
              const rect = new fabric.Rect.fromObject(shape, (item: any) => {
                canvas.add(item);
                item.selectable = false;
              });
            }
            if (shape.type === "circle") {
              const circle = new fabric.Circle.fromObject(shape, (item: any) => {
                canvas.add(item);
                item.selectable = false;
              });
            }
          });
        }
      });
      if (showHideWhiteboard.value) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      }
    };
    watch(studentShapes, () => {
      renderStudentsShapes();
    });
    onMounted(async () => {
      await boardSetup();
      await defaultWhiteboard();
      strokeColor.value = DEFAULT_COLOR;
      canvas.freeDrawingBrush.color = DEFAULT_COLOR;
    });
    onUnmounted(() => {
      canvas.dispose();
    });

    return {
      currentExposureItemMedia,
      clickedTool,
      cursorPosition,
      toolNames,
      toolSelected,
      selectorOpen,
      strokeWidth,
      strokeColor,
      updateColorValue,
      updateStrokeWidth,
      hasStickerTool,
      showWhiteboard,
      showHideWhiteboard,
      hideWhiteboard,
      isLessonPlan,
      imageUrl,
      imgLoad,
    };
  },
});
