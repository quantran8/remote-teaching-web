import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { gsap } from "gsap";
import { fabric } from "fabric";
import { toolType } from "./types";
import { starPolygonPoints } from "commonui";
import { TeacherModel } from "@/models";

const randomPosition = () => Math.random() * 100;

const defaultCanvasDimension = {
  width: 717,
  height: 435,
};

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    let canvas: any;
    const containerRef = ref<HTMLDivElement>();
    const scaleRatio = ref(1);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isShowWhiteBoard = computed(() => store.getters["studentRoom/isShowWhiteboard"]);
    const isGalleryView = computed(() => store.getters["studentRoom/isGalleryView"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/isLessonPlan"]);
    const activeColor = ref("black");
    const toolActive = ref("move");
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
    const teacherForST = computed<TeacherModel>(() => store.getters["studentRoom/teacher"]);
    const studentStrokes = computed(() => store.getters["annotation/studentStrokes"]);
    const oneOneTeacherStrokes = computed(() => store.getters["annotation/oneOneTeacherStrokes"]);
    const oneTeacherShapes = computed(() => store.getters["annotation/oneTeacherShape"]);
    const oneOneStatus = ref<boolean>(false);
    const oneOneIdNear = ref<string>("");
    const isPaletteVisible = computed(
      () => (student.value?.isPalette && !studentOneAndOneId.value) || (student.value?.isPalette && student.value?.id == studentOneAndOneId.value),
    );
    watch(isShowWhiteBoard, () => {
      if (isShowWhiteBoard.value) {
        if (!studentOneAndOneId.value || student.value.id == studentOneAndOneId.value) {
          canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
        }
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
        canvas.isDrawingMode = false;
      }
    });
    const brushstrokesRender = (data: any, oneId: any) => {
      data.brushstrokes.forEach((s: any) => {
        const shape = JSON.parse(s);
        if (shape.type === "polygon") {
          const polygon = new fabric.Polygon.fromObject(shape, (item: any) => {
            item.isOneToOne = oneId;
            canvas.add(item);
            item.selectable = false;
          });
        }
        if (shape.type === "rect") {
          const rect = new fabric.Rect.fromObject(shape, (item: any) => {
            item.isOneToOne = oneId;
            canvas.add(item);
            item.selectable = false;
          });
        }
        if (shape.type === "circle") {
          const circle = new fabric.Circle.fromObject(shape, (item: any) => {
            item.isOneToOne = oneId;
            canvas.add(item);
            item.selectable = false;
          });
        }
      });
    };
    const undoStrokeByTeacher = () => {
      if (undoCanvas.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === teacherForST.value.id)
            .filter((obj: any) => obj.type === "path"),
        );
      }
    };
    watch(undoCanvas, () => {
      undoStrokeByTeacher();
    });
    const renderStrokes = (data: any, oneId: any) => {
      data.forEach((s: any) => {
        const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
          item.isOneToOne = oneId;
          item.id = teacherForST.value.id;
          canvas.add(item);
        });
      });
      objectCanvasProcess();
    };
    const renderTeacherStrokes = () => {
      if (canvasData.value && canvasData.value.length > 0) {
        renderStrokes(canvasData.value, null);
      }
    };
    watch(canvasData, () => {
      renderTeacherStrokes();
    });
    const laserPathByTeacher = () => {
      if (laserPath.value) {
        const laserPathLine = new fabric.Path.fromObject(JSON.parse(laserPath.value), (item: any) => {
          item.animate("opacity", "0", {
            duration: 1000,
            easing: fabric.util.ease.easeInOutExpo,
            onChange: () => {
              if (oneOneStatus.value) {
                if (studentOneAndOneId.value === student.value.id) {
                  canvas.add(item);
                }
              } else {
                canvas.add(item);
              }
            },
            onComplete: async () => {
              canvas.remove(item);
              await store.dispatch("studentRoom/clearLaserPen", "");
            },
          });
        });
      }
    };
    watch(laserPath, () => {
      laserPathByTeacher();
    });
    const studentSharingShapes = () => {
      if (studentShapes.value) {
        studentShapes.value.forEach((item: any) => {
          if (item.userId !== teacherForST.value.id) {
            if (item.userId !== student.value.id) {
              canvas.remove(
                ...canvas
                  .getObjects()
                  .filter((obj: any) => obj.id !== student.value.id)
                  .filter((obj: any) => obj.id !== teacherForST.value.id)
                  .filter((obj: any) => obj.type !== "path"),
              );
              brushstrokesRender(item, null);
            }
          }
        });
      } else {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.type !== "path"));
      }
    };
    watch(studentShapes, () => {
      studentSharingShapes();
    });
    const teacherSharingShapes = (dataShapes: any, studentOneId: any) => {
      if (dataShapes) {
        dataShapes.forEach((item: any) => {
          if (item.userId === teacherForST.value.id) {
            canvas.remove(
              ...canvas
                .getObjects()
                .filter((obj: any) => obj.type !== "path")
                .filter((obj: any) => obj.id === teacherForST.value.id),
            );
            brushstrokesRender(item, studentOneId);
          }
        });
      } else {
        // canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === teacherForST.value.id));
      }
    };
    watch(teacherShapes, () => {
      teacherSharingShapes(teacherShapes.value, null);
    });
    const studentSharingStrokes = () => {
      if (studentStrokes.value && studentStrokes.value.length > 0) {
        if (!studentOneAndOneId.value) {
          studentStrokes.value.forEach((s: any) => {
            if (s.id !== student.value.id) {
              const path = new fabric.Path.fromObject(JSON.parse(s), (item: any) => {
                item.isOneToOne = null;
                canvas.add(item);
              });
            }
          });
          objectCanvasProcess();
        }
      } else {
        canvas.remove(...canvas.getObjects("path"));
      }
    };
    watch(studentStrokes, () => {
      studentSharingStrokes();
    });
    const renderOneTeacherStrokes = () => {
      if (oneOneTeacherStrokes.value && oneOneTeacherStrokes.value.length > 0 && studentOneAndOneId.value === student.value.id) {
        renderStrokes(oneOneTeacherStrokes.value, studentOneAndOneId.value);
      }
    };
    watch(oneOneTeacherStrokes, () => {
      renderOneTeacherStrokes();
    });
    const renderOneTeacherShapes = () => {
      if (oneTeacherShapes.value && oneTeacherShapes.value.length > 0 && studentOneAndOneId.value === student.value.id) {
        teacherSharingShapes(oneTeacherShapes.value, studentOneAndOneId.value);
      }
    };
    watch(oneTeacherShapes, () => {
      renderOneTeacherShapes();
    });
    const selfStudentShapes = () => {
      if (studentShapes.value) {
        studentShapes.value.forEach((item: any) => {
          if (item.userId === student.value.id) {
            canvas.remove(
              ...canvas
                .getObjects()
                .filter((obj: any) => obj.id === student.value.id)
                .filter((obj: any) => obj.type !== "path"),
            );
            brushstrokesRender(item, null);
          }
        });
      }
    };
    watch(studentOneAndOneId, () => {
      if (studentOneAndOneId.value) {
        oneOneIdNear.value = studentOneAndOneId.value;
        oneOneStatus.value = true;
        if (studentOneAndOneId.value !== student.value.id) {
          // disable shapes of student not 1-1
          canvas.isDrawingMode = false;
          canvas.discardActiveObject();
          canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path")
            .filter((obj: any) => obj.id !== studentOneAndOneId.value)
            .forEach((item: any) => {
              item.selectable = false;
              item.hasControls = false;
              item.hasBorders = false;
              item.hoverCursor = "cursor";
            });
        }
      } else {
        oneOneStatus.value = false;
        if (student.value.id === oneOneIdNear.value) {
          canvas.remove(...canvas.getObjects().filter((obj: any) => obj.isOneToOne !== null));
          // render shapes objects again
          teacherSharingShapes(teacherShapes.value, null);
          studentSharingShapes();
          selfStudentShapes();
          oneOneIdNear.value = "";
        }
        // enable shapes of each students
        listenSelfStudent();
      }
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
    const processPushShapes = async () => {
      if (oneOneStatus.value) {
        if (studentOneAndOneId.value === student.value.id) {
          await studentAddShapes();
        }
      } else {
        await studentAddShapes();
      }
    };
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async () => {
        canvas.renderAll();
        if (canvas.isDrawingMode) {
          const studentStrokes = canvas.getObjects("path").filter((obj: any) => obj.id === student.value.id);
          const lastStroke = studentStrokes[studentStrokes.length - 1];
          await store.dispatch("studentRoom/studentDrawsLine", JSON.stringify(lastStroke));
        } else {
          await processPushShapes();
        }
      });
    };
    const listenCreatedPath = () => {
      canvas.on("path:created", (obj: any) => {
        obj.path.id = student.value.id;
        obj.path.isOneToOne = studentOneAndOneId.value || null;
      });
    };
    const listenSelfStudent = () => {
      canvas
        .getObjects()
        .filter((obj: any) => obj.type !== "path")
        .filter((obj: any) => obj.id === student.value.id)
        .forEach((item: any) => {
          item.selectable = true;
        });
    };
    const listenToCanvasEvents = () => {
      listenToMouseUp();
      listenCreatedPath();
      listenSelfStudent();
    };
    const canvasRef = ref(null);
    const boardSetup = () => {
      if (!canvasRef.value) return;
      const { width, height } = defaultCanvasDimension;
      canvas = new fabric.Canvas(canvasRef.value, {
        width,
        height,
      });

      canvas.selectionFullyContained = false;
      canvas.getObjects("path").forEach((obj: any) => {
        obj.selectable = false;
      });
      renderTeacherStrokes();
      studentSharingShapes();
      teacherSharingShapes(teacherShapes.value, null);
      studentSharingStrokes();
      selfStudentShapes();
      listenToCanvasEvents();
      resizeCanvas();
    };

    const resizeCanvas = () => {
      const outerCanvasContainer = containerRef.value;
      if (!outerCanvasContainer) {
        return;
      }
      const ratio = canvas.getWidth() / canvas.getHeight();

      const containerWidth = outerCanvasContainer.clientWidth;
      const scale = containerWidth / canvas.getWidth();
      const zoom = canvas.getZoom() * scale;
      scaleRatio.value = zoom;
      canvas.setDimensions({ width: containerWidth, height: containerWidth / ratio });
      canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
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
      toolActive.value = "move";
      objectCanvasProcess();
    };
    const addStar = async () => {
      toolActive.value = "star";
      const points = starPolygonPoints(5, 35, 15);
      const star = new fabric.Polygon(points, {
        stroke: activeColor.value,
        left: randomPosition(),
        top: randomPosition(),
        strokeWidth: 3,
        strokeLineJoin: "round",
        fill: "",
        id: student.value.id,
        isOneToOne: studentOneAndOneId.value || null,
      });
      canvas.isDrawingMode = false;
      canvas.add(star);
      await studentAddShapes();
    };

    const addCircle = async () => {
      toolActive.value = "circle";
      const circle = new fabric.Circle({
        left: randomPosition(),
        top: randomPosition(),
        radius: 30,
        fill: "",
        stroke: activeColor.value,
        strokeWidth: 3,
        id: student.value.id,
        isOneToOne: studentOneAndOneId.value || null,
      });
      canvas.isDrawingMode = false;
      canvas.add(circle);
      await studentAddShapes();
    };

    const addSquare = async () => {
      toolActive.value = "square";
      const square = new fabric.Rect({
        left: randomPosition(),
        top: randomPosition(),
        width: 50,
        height: 50,
        fill: "",
        stroke: activeColor.value,
        strokeWidth: 3,
        id: student.value.id,
        isOneToOne: studentOneAndOneId.value || null,
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
      toolActive.value = "pen";
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = activeColor.value;
      canvas.freeDrawingBrush.width = 4;
    };

    onMounted(() => {
      boardSetup();
      window.addEventListener("resize", resizeCanvas);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", resizeCanvas);
    });

    const paletteTools: Array<toolType> = [
      {
        name: "move",
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
      gsap.from(element, { duration: 0.5, height: 0, ease: "bounce", clearProps: "all" });
      gsap.from(element.querySelectorAll(".palette-tool__item"), { duration: 0.5, scale: 0, ease: "back", delay: 0.5, stagger: 0.1 });
      gsap.from(element.querySelector(".palette-tool__colors"), { duration: 0.5, scale: 0, delay: 1, ease: "back" });
    };
    const actionLeave = async (element: HTMLElement, done: any) => {
      await gsap.to(element.querySelectorAll(".palette-tool__item"), { duration: 0.1, scale: 0, stagger: 0.1 });
      await gsap.to(element.querySelector(".palette-tool__colors"), { duration: 0.1, scale: 0 });
      await gsap.to(element, { height: 0, onComplete: done, duration: 0.3 });
      animationCheck.value = true;
    };
    const hasPalette = computed(() => !isPaletteVisible.value && animationDone.value);
    return {
      containerRef,
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
      isPaletteVisible,
      hasPalette,
      isGalleryView,
      toolActive,
      isLessonPlan,
    };
  },
});
