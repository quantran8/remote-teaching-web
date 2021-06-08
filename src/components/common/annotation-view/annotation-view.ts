import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { gsap } from "gsap";
import { fabric } from "fabric";
import { toolType } from "./types";
import { starPolygonPoints } from "commonui";

const randomPosition = () => Math.random() * 100;

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    let canvas: any;
    const scaleRatio = ref(1);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
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
    const teacherShapes = computed(() => store.getters["annotation/teacherShape"]);
    console.log(teacherShapes.value, "tttttttttttttttt");
    const renderCanvas = () => {
      if (!canvas) return;
      // whiteboard processing
      if (isShowWhiteBoard.value) {
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
      }
      if (undoCanvas.value) {
        console.log(undoCanvas.value, "undocanvas value");
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id !== student.value.id)
            .filter((obj: any) => obj.type === "path"),
        );
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
      } else {
        console.log("teacher drawing else");
        canvas.remove(...canvas.getObjects());
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
          if (item.userId !== student.value.id) {
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
        if (canvas.isDrawingMode) {
          // await send path student drawing
          canvas.getObjects().forEach((obj: any) => {
            if (obj.id === student.value.id) {
              console.log(obj, "obj path");
            }
          });
        } else {
          console.log("mouse up shapes");
          await studentAddShapes();
        }
      });
    };
    const listenCreatedPath = () => {
      canvas.on("path:created", (obj: any) => {
        obj.path.id = student.value.id;
      });
    };
    const listenToCanvasEvents = () => {
      listenToMouseUp();
      listenCreatedPath();
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
    const objectCanvasProcess = () => {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === "path") {
          obj.selectable = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.hoverCursor = "cursor";
        }
      });
    };
    const cursorHand = () => {
      canvas.isDrawingMode = false;
      objectCanvasProcess();
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
        id: student.value.id,
      });
      canvas.isDrawingMode = false;
      canvas.add(star);
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
        id: student.value.id,
      });
      canvas.isDrawingMode = false;
      canvas.add(circle);
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
        id: student.value.id,
      });
      canvas.isDrawingMode = false;
      canvas.add(square);
      await studentAddShapes();
    };

    const clearStar = () => {
      canvas.remove(...canvas.getObjects("polygon"));
      canvas.renderAll();
    };

    const addDraw = () => {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = activeColor.value;
      canvas.freeDrawingBrush.width = 3;
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
        name: "cursor",
        action: cursorHand,
      },
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
      { name: "pen", action: addDraw },
    ];

    const colorsList = ["black", "red", "orange", "yellow", "green", "blue", "purple", "white"];

    const changeColor = (color: string) => {
      activeColor.value = color;
      if (canvas.isDrawingMode) {
        canvas.freeDrawingBrush.color = color;
      }
    };
    const animationCheck = ref(true);
    const animationDone = computed(() => animationCheck.value);
    const actionEnter = (element: HTMLElement) => {
      animationCheck.value = false;
      gsap.from(element, { duration: 0.5, height: 0, ease: "bounce" });
      gsap.from(element.querySelectorAll(".palette-tool__item"), { duration: 0.5, scale: 0, ease: "back", delay: 0.5, stagger: 0.1 });
      gsap.from(element.querySelector(".palette-tool__colors"), { duration: 0.5, scale: 0, delay: 1, ease: "back" });
    };
    const actionLeave = async (element: HTMLElement, done: any) => {
      await gsap.to(element.querySelectorAll(".palette-tool__item"), { duration: 0.1, scale: 0, stagger: 0.1 });
      await gsap.to(element.querySelector(".palette-tool__colors"), { duration: 0.1, scale: 0 });
      await gsap.to(element, { height: 0, onComplete: done, duration: 0.3 });
      animationCheck.value = true;
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
      actionEnter,
      actionLeave,
      animationDone,
    };
  },
});
