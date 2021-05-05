import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import { toolType } from "./types";
import { Tools } from "commonui";
import { MIN_SPEAKING_LEVEL } from "@/utils/constant";

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    let canvas: any;
    const scaleRatio = ref(1);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isShowWhiteBoard = computed(() => store.getters["studentRoom/isShowWhiteboard"]);

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
      if (!canvas) return;
      // whiteboard processing
      if (isShowWhiteBoard.value) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
      if (undoCanvas.value) {
        canvas.remove(...canvas.getObjects("path"));
      }
      // teacher drawing
      if (canvasData.value) {
        canvasData.value.forEach((s: any) => {
          const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
            canvas.add(item);
          });
        });
        canvas.getObjects("path").forEach((obj: any) => {
          obj.selectable = false;
        });
      }
      // laser processing
      if (laserPath.value) {
        const laserPathLine = new fabric.Path.fromObject(JSON.parse(laserPath.value), (item: any) => {
          item.animate("opacity", "0", {
            duration: 1000,
            easing: fabric.util.ease.easeInOutExpo,
            onChange: () => {
              canvas.add(item);
            },
            onComplete: async () => {
              canvas.remove(item);
              await store.dispatch("studentRoom/clearLaserPen", "");
            },
          });
        });
      }
      // students sharing shapes
      if (studentShapes.value) {
        studentShapes.value.forEach((item: any) => {
          console.log(item, "students shape sharing");
          if (item.studentId !== student.value.id) {
            console.log(item.studentId, student.value.id, "check id student");
            canvas.remove(
              ...canvas
                .getObjects()
                .filter((obj: any) => obj.id !== student.value.id)
                .filter((obj: any) => obj.type !== "path"),
            );
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
      } else {
        canvas.remove(...canvas.getObjects("polygon"));
        canvas.remove(...canvas.getObjects("rect"));
        canvas.remove(...canvas.getObjects("circle"));
      }
    };
    watch(isShowWhiteBoard, () => {
      if (isShowWhiteBoard.value) {
        if (!studentOneAndOneId.value || student.value.id == studentOneAndOneId.value) {
          canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
        }
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
    });
    watch(undoCanvas, () => {
      renderCanvas();
    });
    watch(canvasData, () => {
      renderCanvas();
    });
    watch(laserPath, () => {
      renderCanvas();
    });
    watch(studentShapes, () => {
      renderCanvas();
    });
    const studentAddShapes = async () => {
      const shapes: Array<string> = [];
      canvas.getObjects().forEach((obj: any) => {
        if (obj.id === student.value.id) {
          obj = obj.toJSON();
          obj.id = student.value.id;
          shapes.push(JSON.stringify(obj));
        }
      });
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
        stroke: "black",
        left: 100,
        top: 10,
        strokeWidth: 3,
        strokeLineJoin: "round",
        fill: "white",
        id: student.value.id,
      });

      canvas.add(star);
      await studentAddShapes();
    };

    const addCircle = async () => {
      const circle = new fabric.Circle({
        radius: 30,
        fill: "",
        stroke: "black",
        strokeWidth: 3,
        id: student.value.id,
      });
      canvas.add(circle);
      await studentAddShapes();
    };

    const addSquare = async () => {
      const square = new fabric.Rect({
        width: 50,
        height: 50,
        fill: "",
        stroke: "black",
        strokeWidth: 3,
        id: student.value.id,
      });

      canvas.add(square);
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

    return {
      pointerStyle,
      imageUrl,
      // boardSetup,
      isPointerMode,
      canvasRef,
      // stickerColors,
      // checkStickerAdded,
      // changeColorSticker,
      // isStickerMode,
      // checkStickers,
      isShowWhiteBoard,
      addStar,
      clearStar,
      student,
      studentOneAndOneId,
      paletteTools,
    };
  },
});
