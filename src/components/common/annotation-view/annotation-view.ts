import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import { toolType } from "./types";
import { Tools } from "commonui";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";

const randomPosition = () => Math.random() * 100;

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    let canvas: any;
    const scaleRatio = ref(1);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isShowWhiteBoard = computed(() => store.getters["studentRoom/isShowWhiteboard"]);
    const activeColor = ref("black");
    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } = store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      return `transform: translate(${pointer.x * scaleRatio.value}px, ${pointer.y * scaleRatio.value}px)`;
    });
    watch(isPointerMode, () => {
      return pointerStyle;
    });
    const imageUrl = computed(() => {
      return props.image ? props.image.url : {};
    });
    const undoCanvas = computed(() => store.getters["annotation/undoShape"]);
    const canvasData = computed(() => store.getters["annotation/shapes"]);
    const laserPath = computed(() => store.getters["studentRoom/laserPath"]);
    const student = computed(() => store.getters["studentRoom/student"]);
    const studentOneAndOneId = computed(() => store.getters["studentRoom/getStudentModeOneId"]);
    const studentShapes = computed(() => store.getters["annotation/studentShape"]);
    const renderCanvas = () => {
      if (!canvas || !canvasData.value) return;
      const shapes: Array<string> = canvasData.value;
      if (laserPath.value) {
        shapes.push(laserPath.value);
      }
      const canvasJsonData = {
        objects: shapes
          .map(s => {
            const obj = JSON.parse(s);
            obj.width = Math.floor(obj.width * scaleRatio.value);
            obj.height = Math.floor(obj.height * scaleRatio.value);
            obj.top = Math.floor(obj.top * scaleRatio.value);
            obj.left = Math.floor(obj.left * scaleRatio.value);
            obj.scaleX = obj.scaleX * scaleRatio.value;
            obj.scaleY = obj.scaleY * scaleRatio.value;
            return obj;
          })
          .filter(s => s !== null),
      };
      canvas.loadFromJSON(JSON.stringify(canvasJsonData), canvas.renderAll.bind(canvas));
      canvas.getObjects("path").forEach((obj: any) => {
        obj.selectable = false;
      });
      if (isShowWhiteBoard.value) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
      if (laserPath.value) {
        const laserLine = canvas.getObjects("path").pop();
        laserLine.animate("opacity", "0", {
          duration: 1000,
          easing: fabric.util.ease.easeInOutExpo,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: async () => {
            shapes.pop();
            canvas.remove(laserLine);
            await store.dispatch("studentRoom/clearLaserPen", "");
          },
        });
      }
    };
    watch(undoCanvas, () => {
      renderCanvas();
    });
    watch(laserPath, () => {
      renderCanvas();
    });
    watch(canvasData, renderCanvas);
    watch(isShowWhiteBoard, () => {
      if (isShowWhiteBoard.value) {
        if (!studentOneAndOneId.value || student.value.id == studentOneAndOneId.value) {
          canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
        }
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
    });
    const studentAddShapes = async () => {
      const canvasAsJSON = canvas.toJSON();
      const shapes = canvasAsJSON.objects.filter((s: any) => s.type !== "path").map((s: any) => JSON.stringify(s));
      if (shapes.length) {
        await store.dispatch("studentRoom/studentAddShape", shapes);
      }
    };
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async () => {
        canvas.renderAll();
        await studentAddShapes();
      });
    };
    const listenToCanvasEvents = () => {
      listenToMouseUp();
    };
    const boardSetup = () => {
      const canvasEl = document.getElementById("canvasOnStudent");
      if (!canvasEl) return;
      canvas = new fabric.Canvas("canvasOnStudent");
      canvas.setWidth(717);
      canvas.setHeight(435);
      canvas.selectionFullyContained = false;
      canvas.getObjects("path").forEach((obj: any) => {
        obj.selectable = false;
      });

      renderCanvas();
      listenToCanvasEvents();
    };

    const starPolygonPoints = (spikeCount: any, outerRadius: any, innerRadius: any) => {
      let rot = (Math.PI / 2) * 3;
      const cx = outerRadius;
      const cy = outerRadius;
      const sweep = Math.PI / spikeCount;
      const points = [];

      for (let i = 0; i < spikeCount; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        points.push({ x: x, y: y });
        rot += sweep;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        points.push({ x: x, y: y });
        rot += sweep;
      }
      return points;
    };

    const addStar = async () => {
      const points = starPolygonPoints(5, 35, 15);
      const star = new fabric.Polygon(points, {
        stroke: activeColor.value,
        left: randomPosition(),
        top: randomPosition(),
        strokeWidth: 3,
        strokeLineJoin: "round",
        fill: "",
      });

      canvas.add(star);
      canvas.renderAll();
      await studentAddShapes();
    };

    const addCircle = async () => {
      const circle = new fabric.Circle({
        left: randomPosition(),
        top: randomPosition(),
        radius: 30,
        fill: "",
        stroke: activeColor.value,
        strokeWidth: 3,
      });
      canvas.add(circle);
      canvas.renderAll();
      await studentAddShapes();
    };

    const addSquare = async () => {
      const square = new fabric.Rect({
        left: randomPosition(),
        top: randomPosition(),
        width: 50,
        height: 50,
        fill: "",
        stroke: activeColor.value,
        strokeWidth: 3,
      });

      canvas.add(square);
      canvas.renderAll();
      await studentAddShapes();
    };

    const clearStar = () => {
      canvas.remove(...canvas.getObjects("polygon"));
      canvas.renderAll();
    };

    const canvasRef = ref(null);
    onMounted(() => {
      // calcScaleRatio();
      boardSetup();
      // window.addEventListener("resize", calcScaleRatio);
    });
    onUnmounted(() => {
      // window.removeEventListener("resize", calcScaleRatio);
    });

    const paletteTools: Array<toolType> = [
      {
        name: "star",
        action: addStar,
      },
      {
        name: "circle",
        action: addCircle,
      },
      {
        name: "square",
        action: addSquare,
      },
    ];

    const colorsList = ["black", "red", "orange", "yellow", "green", "blue", "purple", "white"];

    const changeColor = (color: string) => {
      activeColor.value = color;
    };

    return {
      pointerStyle,
      imageUrl,
      isPointerMode,
      canvasRef,
      isShowWhiteBoard,
      addStar,
      clearStar,
      student,
      studentOneAndOneId,
      paletteTools,
      activeColor,
      colorsList,
      changeColor,
    };
  },
});
