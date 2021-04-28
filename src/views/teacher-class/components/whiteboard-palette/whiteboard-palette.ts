import { computed, ComputedRef, defineComponent, onMounted, Ref, ref, watch, onUnmounted } from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import { Tools, Mode } from "@/commonui";
import ToolsCanvas from "@/components/common/annotation/tools/tools-canvas.vue";
import { ClassView } from "@/store/room/interface";

export default defineComponent({
  props: ["image"],
  components: {
    ToolsCanvas,
  },
  setup(props) {
    const store = useStore();
    const currentExposureItemMedia: ComputedRef = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const isLessonPlan = computed(() => store.getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const infoTeacher = computed(() => store.getters["teacherRoom/info"]);
    const oneAndOne = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);

    let canvas: any;
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);
    const toolSelected: Ref<string> = ref("cursor");
    const strokeColor: Ref<string> = ref("#000000");
    const strokeWidth: Ref<number> = ref(2);
    const selectorOpen: Ref<boolean> = ref(false);
    const modeAnnotation: Ref<number> = ref(-1);
    const hasStickerTool: Ref<boolean> = ref(false);
    const showHideWhiteboard: Ref<boolean> = ref(false);
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
        toolSelected.value = Tools.Clear;
        canvas.remove(...canvas.getObjects("path"));
        await store.dispatch("teacherRoom/setClearBrush", {});
        toolSelected.value = Tools.Pen;
        canvas.isDrawingMode = true;
        modeAnnotation.value = Mode.Draw;
        await store.dispatch("teacherRoom/setMode", {
          mode: modeAnnotation.value,
        });
      }
    });
    if (currentExposure.value) {
      if (currentExposure.value.type == "poems" || currentExposure.value.type == "bigbook") {
        hasStickerTool.value = true;
      }
    }
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
      });
    };
    // LISTENING TO CANVAS EVENTS
    const listenToCanvasEvents = () => {
      listenToMouseUp();
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
          modeAnnotation.value = Mode.Cursor;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          canvas.getObjects().forEach((obj: any) => {
            obj.selectable = false;
            obj.hasControls = false;
            obj.hasBorders = false;
            obj.hoverCursor = "cursor";
          });
          return;
        case Tools.Pen:
          toolSelected.value = Tools.Pen;
          canvas.remove(...canvas.getObjects("rect"));
          await store.dispatch("teacherRoom/setClearStickers", {});
          modeAnnotation.value = Mode.Draw;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          canvas.freeDrawingBrush.color = strokeColor.value;
          canvas.freeDrawingBrush.width = strokeWidth.value;
          return;
        case Tools.Laser:
          toolSelected.value = Tools.Laser;
          canvas.isDrawingMode = true;
          modeAnnotation.value = Mode.Draw;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          return;
        case Tools.Stroke:
          toolSelected.value = Tools.Stroke;
          canvas.getObjects().forEach((obj: any) => {
            obj.selectable = false;
          });
          return;
        case Tools.StrokeColor:
          toolSelected.value = Tools.StrokeColor;
          canvas.getObjects().forEach((obj: any) => {
            obj.selectable = false;
          });
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
          modeAnnotation.value = Mode.Draw;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          return;
        case Tools.Clear:
          toolSelected.value = Tools.Clear;
          canvas.remove(...canvas.getObjects("path"));
          await store.dispatch("teacherRoom/setClearBrush", {});
          toolSelected.value = Tools.Pen;
          canvas.isDrawingMode = true;
          modeAnnotation.value = Mode.Draw;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          return;
        default:
          return;
      }
    };
    const updateColorValue = (value: any) => {
      if (toolSelected.value === Tools.StrokeColor) {
        strokeColor.value = value;
        clickedTool(Tools.Pen).then();
        if (canvas.getActiveObject()) {
          canvas.getActiveObject().set("stroke", strokeColor.value);
          canvas.renderAll();
        }
      }
      if (canvas.isDrawingMode) {
        canvas.freeDrawingBrush.color = strokeColor.value;
      }
    };
    const updateStrokeWidth = (value: number) => {
      strokeWidth.value = value;
      selectorOpen.value = false;
      clickedTool(Tools.Pen).then();
      if (canvas.getActiveObject()) {
        canvas.getActiveObject().set("strokeWidth", strokeWidth.value);
        canvas.renderAll();
      }
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
      canvas.remove(...canvas.getObjects("path"));
      await store.dispatch("teacherRoom/setClearBrush", {});
      canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
    };
    const imgLoad = async () => {
      if (!canvas) return;
      canvas.remove(...canvas.getObjects("path"));
      showHideWhiteboard.value = false;
      canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      await clickedTool(Tools.Cursor);
    };
    const defaultWhiteboard = async () => {
      modeAnnotation.value = Mode.Cursor;
      await store.dispatch("teacherRoom/setMode", {
        mode: modeAnnotation.value,
      });
      await store.dispatch("teacherRoom/setClearBrush", {});
    };
    onMounted(async () => {
      await boardSetup();
      await defaultWhiteboard();
    });
	onUnmounted(() => {
		canvas.dispose()
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
