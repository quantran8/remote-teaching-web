import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { gsap } from "gsap";
import { fabric } from "fabric";
import { DefaultCanvasDimension } from "commonui";
import { TeacherModel } from "@/models";
import { useFabricObject } from "@/hooks/use-fabric-object";
import { LastFabricUpdated } from "@/store/annotation/state";
import { Popover } from "ant-design-vue";
import { studentAddedShapes } from "@/components/common/annotation-view/components/add-shapes";
import { brushstrokesRender } from "@/components/common/annotation-view/components/brush-strokes";
import { annotationCurriculumStudent } from "@/components/common/annotation-view/components/annotation-curriculum";
import { laserPen } from "@/components/common/annotation-view/components/laser-path";

export default defineComponent({
  props: ["image"],
  components: {
    Popover,
  },
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
    watch(isPaletteVisible, () => {
      if (!isPaletteVisible.value) {
        canvas.isDrawingMode = false;
        toolActive.value = "";
      }
    });
    const firstTimeVisit = ref(false);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const undoStrokeOneOne = computed(() => store.getters["annotation/undoStrokeOneOne"]);
    const { displayFabricItems, displayCreatedItem, displayModifiedItem, onObjectCreated } = useFabricObject();
    watch(currentExposureItemMedia, (currentItem, prevItem) => {
      if (currentItem && prevItem) {
        if (currentItem.id !== prevItem.id) {
          canvas.remove(...canvas.getObjects());
        }
      }
    });
    const { processPushShapes, addStar, addCircle, addSquare } = studentAddedShapes();
    const { processAnnotationLesson } = annotationCurriculumStudent();
    const processCanvasWhiteboard = () => {
      if (isShowWhiteBoard.value) {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
        if (!studentOneAndOneId.value || student.value.id == studentOneAndOneId.value) {
          canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
        }
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
        toolActive.value = "";
        canvas.isDrawingMode = false;
        processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard);
      }
    };
    watch(isShowWhiteBoard, () => {
      processCanvasWhiteboard();
    });
    const undoStrokeByTeacher = () => {
      if (undoCanvas.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type === "path")
            .filter((obj: any) => obj.id === teacherForST.value.id),
        );
      }
    };
    watch(undoCanvas, () => {
      undoStrokeByTeacher();
    });
    const undoStrokeByTeacherOneOne = () => {
      if (undoStrokeOneOne.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type === "path")
            .filter((obj: any) => obj.id === teacherForST.value.id),
        );
      }
    };
    watch(undoStrokeOneOne, () => {
      if (studentOneAndOneId.value === student.value.id) {
        undoStrokeByTeacherOneOne();
      }
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
      listenSelfStudent();
    };
    const renderTeacherStrokes = () => {
      if (canvasData.value && canvasData.value.length > 0) {
        renderStrokes(canvasData.value, null);
      }
    };
    watch(canvasData, async () => {
      await nextTick();
      renderTeacherStrokes();
    });
    watch(laserPath, () => {
      laserPen(laserPath, canvas, oneOneStatus, studentOneAndOneId, student);
    });
    const studentSharingShapes = () => {
      if (studentShapes.value && studentShapes.value.length) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id !== student.value.id)
            .filter((obj: any) => obj.id !== teacherForST.value.id)
            .filter((obj: any) => obj.id !== "annotation-lesson")
            .filter((obj: any) => obj.type !== "path")
            .filter((obj: any) => !obj.objectId),
        );
        studentShapes.value.forEach((item: any) => {
          if (item.userId !== teacherForST.value.id) {
            if (item.userId !== student.value.id) {
              brushstrokesRender(canvas, item, null, "student-other-shapes");
            }
          }
        });
        listenSelfStudent();
      } else {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path" && obj.id !== teacherForST.value.id && obj.id !== "annotation-lesson")
            .filter((obj: any) => !obj.objectId),
        );
      }
    };
    watch(studentShapes, () => {
      studentSharingShapes();
      if (!firstTimeVisit.value && studentShapes.value) {
        selfStudentShapes();
        firstTimeVisit.value = true;
      } else if (studentShapes.value && studentShapes.value.length === 0) {
        canvas.remove(
          ...canvas.getObjects().filter((obj: any) => obj.type !== "path" && obj.id !== teacherForST.value.id && obj.id !== "annotation-lesson"),
        );
      }
    });
    const teacherSharingShapes = (dataShapes: any, studentOneId: any) => {
      if (dataShapes) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path")
            .filter((obj: any) => obj.id === teacherForST.value.id),
        );
        dataShapes.forEach((item: any) => {
          if (item.userId === teacherForST.value.id) {
            brushstrokesRender(canvas, item, studentOneId, "teacher-shapes");
          }
        });
      } else {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === teacherForST.value.id && obj.tag === "teacher-shapes"));
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
                item.tag = "student-other-strokes";
                canvas.add(item);
              });
            }
          });
          objectCanvasProcess();
        }
      } else {
        canvas.remove(...canvas.getObjects("path").filter((obj: any) => obj.tag === "student-other-strokes" || obj.tag === "self-strokes"));
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
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === student.value.id)
            .filter((obj: any) => obj.type !== "path"),
        );
        studentShapes.value.forEach((item: any) => {
          if (item.userId === student.value.id) {
            brushstrokesRender(canvas, item, null, "student-self-shapes");
          }
        });
        listenSelfStudent();
      }
    };
    watch(studentOneAndOneId, () => {
      if (studentOneAndOneId.value) {
        oneOneIdNear.value = studentOneAndOneId.value;
        oneOneStatus.value = true;
        processCanvasWhiteboard();
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
          processCanvasWhiteboard();
          setTimeout(() => {
            teacherSharingShapes(teacherShapes.value, null);
            studentSharingShapes();
            selfStudentShapes();
            oneOneIdNear.value = "";
          }, 800);
        }
        // enable shapes of each students
        listenSelfStudent();
      }
    });
    const listenToMouseUp = () => {
      canvas.on("mouse:up", async () => {
        canvas.renderAll();
        if (canvas.isDrawingMode) {
          const studentStrokes = canvas.getObjects("path").filter((obj: any) => obj.id === student.value.id);
          const lastStroke = studentStrokes[studentStrokes.length - 1];
          await store.dispatch("studentRoom/studentDrawsLine", JSON.stringify(lastStroke));
        } else {
          processPushShapes(canvas, student, oneOneStatus, studentOneAndOneId);
        }
      });
    };
    const listenCreatedPath = () => {
      canvas.on("path:created", (obj: any) => {
        obj.path.id = student.value.id;
        obj.path.isOneToOne = studentOneAndOneId.value || null;
        obj.path.tag = "self-strokes";
        obj.perPixelTargetFind = true;
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
      onObjectCreated(canvas);
    };
    const canvasRef = ref(null);
    const boardSetup = () => {
      if (!canvasRef.value) return;
      const { width, height } = DefaultCanvasDimension;
      canvas = new fabric.Canvas(canvasRef.value, {
        width,
        height,
      });
      canvas.selectionFullyContained = false;
      canvas.getObjects("path").forEach((obj: any) => {
        obj.selectable = false;
        obj.perPixelTargetFind = true;
      });
      listenToCanvasEvents();
      resizeCanvas();
    };
    const imgLoad = () => {
      processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard);
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
      canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson"));
      processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard);
    };
    const objectCanvasProcess = () => {
      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === "path") {
          obj.selectable = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.hoverCursor = "cursor";
          obj.perPixelTargetFind = true;
        }
      });
    };
    const cursorHand = () => {
      canvas.isDrawingMode = false;
      toolActive.value = "move";
      objectCanvasProcess();
    };
    const addDraw = () => {
      toolActive.value = "pen";
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = activeColor.value;
      canvas.freeDrawingBrush.width = 4;
    };
    const showListColors = ref<boolean>(false);
    const showListColorsPopover = () => {
      toolActive.value = "colors";
    };
    const hideListColors = () => {
      showListColors.value = false;
    };
    const funAddStar = () => {
      return addStar(canvas, toolActive, student, activeColor, studentOneAndOneId);
    };
    const funAddCircle = () => {
      return addCircle(canvas, toolActive, student, activeColor, studentOneAndOneId);
    };
    const funAddSquare = () => {
      return addSquare(canvas, toolActive, student, activeColor, studentOneAndOneId);
    };
    const paletteTools = [
      { name: "move", action: cursorHand },
      { name: "pen", action: addDraw },
      { name: "star", action: funAddStar },
      { name: "circle", action: funAddCircle },
      { name: "square", action: funAddSquare },
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
      // set mode move by default when active palette
      cursorHand();
      gsap.from(element, { duration: 0.5, height: 0, ease: "bounce", clearProps: "all" });
      gsap.from(element.querySelectorAll(".palette-tool__item"), { duration: 0.5, scale: 0, ease: "back", delay: 0.5, stagger: 0.1 });
    };
    const actionLeave = async (element: HTMLElement, done: any) => {
      await gsap.to(element.querySelectorAll(".palette-tool__item"), { duration: 0.1, scale: 0, stagger: 0.1 });
      await gsap.to(element, { height: 0, onComplete: done, duration: 0.3 });
      animationCheck.value = true;
      canvas.isDrawingMode = false;
      toolActive.value = "";
    };
    const hasPalette = computed(() => !isPaletteVisible.value && animationDone.value);

    //get fabric items from vuex and display to whiteboard
    const fabricItems = computed(() => {
      const oneToOneUserId = store.getters["studentRoom/getStudentModeOneId"];
      if (oneToOneUserId && oneToOneUserId === student.value.id) {
        return store.getters["annotation/fabricItemsOneToOne"];
      }
      return store.getters["annotation/fabricItems"];
    });

    watch(
      fabricItems,
      async value => {
        const oneToOneUserId = store.getters["studentRoom/getStudentModeOneId"];
        if (!oneToOneUserId) {
          await canvas.remove(...canvas.getObjects().filter((obj: any) => obj.objectId));
        }
        displayFabricItems(canvas, value);
      },
      { deep: true },
    );
    //receive the object lastFabricUpdated and update the whiteboard
    const lastFabricUpdated = computed(() => store.getters["annotation/lastFabricUpdated"]);
    const getObjectFromId = (id: string) => {
      const currentObjects = canvas.getObjects();
      return currentObjects.find((obj: any) => obj.objectId === id);
    };
    watch(lastFabricUpdated, (value: LastFabricUpdated) => {
      const { type, data } = value;
      switch (type) {
        case "create": {
          displayCreatedItem(canvas, data);
          break;
        }
        case "modify": {
          const existingObject = getObjectFromId(data.fabricId);
          if (!existingObject) {
            displayCreatedItem(canvas, data);
            break;
          }
          displayModifiedItem(canvas, data, existingObject);
          break;
        }
        default:
          break;
      }
    });
    onMounted(() => {
      boardSetup();
      window.addEventListener("resize", resizeCanvas);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", resizeCanvas);
    });
    return {
      containerRef,
      pointerStyle,
      imageUrl,
      isPointerMode,
      canvasRef,
      isShowWhiteBoard,
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
      imgLoad,
      showListColors,
      showListColorsPopover,
      hideListColors,
    };
  },
});
