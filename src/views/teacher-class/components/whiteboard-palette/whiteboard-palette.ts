import {
  computed,
  ComputedRef,
  defineComponent, onBeforeMount,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import { Tools } from "@/commonui";
import ToolsCanvas from "@/components/common/annotation/tools/tools-canvas.vue";
import * as R from "ramda/";
import {ClassView} from "@/store/room/interface";

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
    watch(infoTeacher, () => {
      if (infoTeacher.value) {
        showHideWhiteboard.value = infoTeacher.value.isShowWhiteBoard;
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
      if (modeAnnotation.value === 1) {
        const { width, height } = currentExposureItemMedia.value.image;
        const rect = document.getElementById("canvas-container");
        if (!rect) return;
        const rectBounding = rect.getBoundingClientRect();
        const wRatio = rectBounding.width / width;
        const hRatio = rectBounding.height / height;
        const ratio = Math.min(wRatio, hRatio);
        const x = (e.clientX - rectBounding.left) / ratio;
        const y = (e.clientY - rectBounding.top) / ratio;
        await store.dispatch("teacherRoom/setPointer", {
          x: Math.floor(x),
          y: Math.floor(y)
        });
      }
    };
    const objectsCanvas = async () => {
      const { width, height } = currentExposureItemMedia.value.image;
      const rect = document.getElementById("canvas-container");
      if (!rect) return;
      const rectBounding = rect.getBoundingClientRect();
      const wRatio = rectBounding.width / width;
      const hRatio = rectBounding.height / height;
      const ratio = Math.min(wRatio, hRatio);
      const canvasAsJSON = canvas.toJSON();
      const lastObject = canvasAsJSON.objects[canvasAsJSON.objects.length - 1];
      lastObject.width = lastObject.width / ratio;
      lastObject.height = lastObject.height / ratio;
      lastObject.top = lastObject.top / ratio;
      lastObject.left = lastObject.left / ratio;
      lastObject.scaleX = lastObject.scaleX / ratio;
      lastObject.scaleY = lastObject.scaleY / ratio;
      await store.dispatch("teacherRoom/setBrush", {
        drawing: lastObject,
      });
    };
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async () => {
        canvas.renderAll();
        if (toolSelected.value === "pen") {
          await objectsCanvas();
        }
      });
    };
    // LISTENING TO CANVAS EVENTS
    const listenToCanvasEvents = () => {
      listenToMouseUp();
    };
    const imgLesson = () => {
      const imageLesson = document.getElementById("annotation-img");
      return imageLesson?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0);
    };
    const boardSetup = async () => {
      if (!props.image) return;
      const canvasEl = document.getElementById("canvasDesignate");
      const canvasContainer = document.getElementsByClassName("canvas-container");
      if (canvasEl && canvasContainer.length == 0) {
        canvas = new fabric.Canvas("canvasDesignate");
      } else {
        canvas.dispose();
        canvas = new fabric.Canvas("canvasDesignate");
      }
      const { width, height } = imgLesson();
      canvas.setWidth(width);
      canvas.setHeight(height);
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
          modeAnnotation.value = 1;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          canvas.getObjects().forEach((obj: any) => {
            obj.selectable = false;
            obj.hasControls = false;
            obj.hasBorders = false;
          });
          return;
        case Tools.Pen:
          toolSelected.value = Tools.Pen;
          canvas.remove(...canvas.getObjects("rect"));
          await store.dispatch("teacherRoom/setClearStickers", {});
          modeAnnotation.value = 2;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value,
          });
          canvas.freeDrawingBrush.color = strokeColor.value;
          canvas.freeDrawingBrush.width = strokeWidth.value;
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
          modeAnnotation.value = 2;
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
          modeAnnotation.value = 2;
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
    const defaultWhiteboard = async () => {
      modeAnnotation.value = 1;
      await store.dispatch("teacherRoom/setMode", {
        mode: modeAnnotation.value,
      });
      await store.dispatch("teacherRoom/setClearBrush", {});
    };
    onMounted(async () => {
      // boardSetup();
      await defaultWhiteboard();
    });
    // onUnmounted(() => {});

    return {
      currentExposureItemMedia,
      imgLesson,
      boardSetup,
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
    };
  },
});
