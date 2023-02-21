import { studentAddedShapes } from "@/components/common/annotation-view/components/add-shapes";
import { annotationCurriculumStudent } from "@/components/common/annotation-view/components/annotation-curriculum";
import { brushstrokesRender } from "@/components/common/annotation-view/components/brush-strokes";
import { laserPen } from "@/components/common/annotation-view/components/laser-path";
import { useFabricObject } from "@/hooks/use-fabric-object";
import { TeacherModel } from "@/models";
import { LastFabricUpdated, UserShape } from "@/store/annotation/state";
import { IMAGE_QUALITY, SESSION_MAXIMUM_IMAGE } from "@/utils/constant";
import { DefaultCanvasDimension, FabricObjectType, SmoothingQuality } from "@/utils/utils";
import { Popover } from "ant-design-vue";
import { fabric } from "fabric";
import { gsap } from "gsap";
import { debounce } from "lodash";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, Ref, ref, watch } from "vue";
import { LoginInfo } from "vue-glcommonui";
import VuePdfEmbed from "vue-pdf-embed";
import { useStore } from "vuex";
import { pencilPen } from "./components/pencil-path";

const DEFAULT_STYLE = {
  width: "100%",
  transform: "scale(1,1) rotate(0deg)",
};

const DEFAULT_CANVAS_ZOOM_RATIO = 1;

export default defineComponent({
  props: ["image", "id"],
  components: {
    Popover,
    VuePdfEmbed,
  },
  setup(props) {
    const store = useStore();
    let canvas: any;
    const containerRef = ref<HTMLDivElement>();
    const scaleRatio = ref(1);
    const oneToOneUserId = computed(() => store.getters["studentRoom/getStudentModeOneId"]);
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isShowWhiteBoard = computed(() => store.getters["studentRoom/isShowWhiteboard"]);
    const isGalleryView = computed(() => store.getters["studentRoom/isGalleryView"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/isLessonPlan"]);
    const loginInfo: LoginInfo = store.getters["auth/getLoginInfo"];
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const undoStrokeOneOne = computed(() => store.getters["annotation/undoStrokeOneOne"]);
    const activeColor = ref("black");
    const toolActive = ref("move");
    const videoAnnotation = ref<HTMLVideoElement | null>(null);
    const audioAnnotation = ref<HTMLVideoElement | null>(null);
    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } = store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      return `transform: translate(${pointer.x * scaleRatio.value}px, ${pointer.y * scaleRatio.value}px)`;
    });
    watch(isPointerMode, () => {
      return pointerStyle;
    });
    // const imageUrl = computed(() => {

    //   return props.image ? props.image.url : {};
    // });
    const imageUrl = computed(() => {
      if (!props.image) {
        return null;
      }
      const image = new Image();
      image.onload = imgLoad;
      image.src = props.image ? props.image.url : {};
      return image.src;
    });
    const undoCanvas = computed(() => store.getters["annotation/undoShape"]);
    const canvasData = computed(() => store.getters["annotation/shapes"]);
    const laserPath = computed(() => store.getters["studentRoom/laserPath"]);
    const pencilPath = computed(() => store.getters["annotation/pencilPath"]);
    const student = computed(() => store.getters["studentRoom/student"]);
    const studentOneAndOneId = computed(() => store.getters["studentRoom/getStudentModeOneId"]);
    const studentShapes = computed(() => store.getters["annotation/studentShape"]);
    const teacherShapes = computed(() => store.getters["annotation/teacherShape"]);
    const teacherForST = computed<TeacherModel>(() => store.getters["studentRoom/teacher"]);
    const studentStrokes = computed(() => store.getters["annotation/studentStrokes"]);
    const oneOneTeacherStrokes = computed(() => store.getters["annotation/oneOneTeacherStrokes"]);
    const oneTeacherShapes = computed(() => store.getters["annotation/oneTeacherShape"]);
    const zoomRatio = computed(() => store.getters["lesson/zoomRatio"]);
    const imgCoords = computed(() => store.getters["lesson/imgCoords"]);
    const imgRenderHeight = computed(() => store.getters["annotation/imgRenderHeight"]);
    const isCaptureImage = computed(() => store.getters["studentRoom/isCaptureImage"]);
    const userInfo = computed(() => store.getters["auth/getLoginInfo"]);
    const classInfo = computed(() => store.getters["studentRoom/info"]);
    const children = computed(() => store.getters["parent/children"]);
    const schoolId = computed(() => children.value.find((child: any) => child.id === student.value.id)?.schoolId);
    const mediaState = computed(() => store.getters["studentRoom/getMediaState"]);
    const currentTimeMedia = computed(() => store.getters["studentRoom/getCurrentTimeMedia"]);

    const oneOneStatus = ref<boolean>(false);
    const oneOneIdNear = ref<string>(studentOneAndOneId.value ?? "");

    let group: any;
    let point: any;
    let captureCanvas: any;
    const prevZoomRatio = ref(1);
    const prevCoords = ref({ x: 0, y: 0 });
    const prevZoomRatioByTeacher = ref(1);

    const isPaletteVisible = computed(
      () => (student.value?.isPalette && !studentOneAndOneId.value) || (student.value?.isPalette && student.value?.id == studentOneAndOneId.value),
    );

    const paletteShown = computed(
      () => (isLessonPlan.value && isPaletteVisible.value) || (isGalleryView.value && isShowWhiteBoard.value && isPaletteVisible.value),
    );

    const mediaTypeId = computed(() => {
      const newId = props.id;
      let result = undefined;
      const listMedia = currentExposure.value?.alternateMediaBlockItems.flat();
      if (listMedia) {
        const target = listMedia.find((item: any) => {
          return newId === item.id;
        });
        if (target) {
          result = target.mediaTypeId;
        }
      }
      return result;
    });

    const isValidUrl = computed(() => {
      return currentExposureItemMedia.value.image.url !== "default" ? true : false;
    });

    watch(
      zoomRatio,
      (currentValue, prevValue) => {
        let zoom = 0;
        if (!prevValue && currentValue) {
          zoom = currentValue - DEFAULT_CANVAS_ZOOM_RATIO;
        }
        if (currentValue && prevValue) {
          zoom = currentValue - prevValue;
        }
        if (isLessonPlan.value && group && currentValue === 1) {
          group.left = group?.realLeft ?? Math.floor(DefaultCanvasDimension.width / 2);
          group.top = group?.realTop ?? Math.floor(imgRenderHeight.value / 2);
        }
        if (canvas && point) {
          canvas.zoomToPoint(point, canvas.getZoom() + zoom * scaleRatio.value);
        }
      },
      { immediate: true },
    );
    watch(imgCoords, (currentValue) => {
      if (!group) {
        return;
      }
      if (currentValue) {
        group.left = currentValue.x;
        group.top = currentValue.y;
      }
      canvas?.renderAll();
    });

    watch(isCaptureImage, async (value) => {
      if (student.value.imageCapturedCount >= SESSION_MAXIMUM_IMAGE) {
        await store.dispatch("studentRoom/setStudentImageCaptured", { id: student.value.id, capture: false });
        return;
      }
      if (value) {
        const context = captureCanvas.getContext("2d");
        const videoEl = document.getElementById(student.value.id)?.getElementsByTagName("video")[0];
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = SmoothingQuality.High;
        context?.drawImage(videoEl as CanvasImageSource, 0, 0, captureCanvas.width, captureCanvas.height);
        const base64Url = captureCanvas.toDataURL("image/jpeg", IMAGE_QUALITY);
        const res = await fetch(base64Url);
        const buffer = await res.arrayBuffer();
        const fileName = `student_${student.value.id}_${Math.floor(Math.random() * 10000)}.jpeg`;
        const file = new File([buffer], fileName, { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("File", file);
        formData.append("SchoolId", schoolId.value);
        formData.append("ClassId", classInfo.value.classInfo.classId);
        formData.append("SessionId", classInfo.value.id);
        formData.append("GroupId", classInfo.value.classInfo.groupId);
        formData.append("StudentId", student.value.id);
        await store.dispatch("studentRoom/setStudentImageCaptured", { id: student.value.id, capture: false });
        await store.dispatch("studentRoom/uploadCapturedImage", {
          token: userInfo.value.access_token,
          formData,
          fileName,
          studentId: student.value.id,
        });
      }
    });

    watch(toolActive, () => {
      if (paletteShown.value) {
        cursorHand();
      }
    });
    watch(
      paletteShown,
      (currentValue) => {
        if (currentValue) {
          cursorHand();
        }
      },
      { immediate: true },
    );

    watch(isPaletteVisible, () => {
      if (!isPaletteVisible.value) {
        canvas.isDrawingMode = false;
        toolActive.value = "";
      }
    });
    const firstTimeVisit = ref(false);
    const styles = ref(DEFAULT_STYLE);

    const { displayFabricItems, displayCreatedItem, displayModifiedItem, onObjectCreated, FontLoader } = useFabricObject();
    watch(currentExposureItemMedia, async (currentItem, prevItem) => {
      if (!currentItem || currentItem.teacherUseOnly) {
        canvas.remove(group);
      }
      if (currentItem && prevItem) {
        if (currentItem.id !== prevItem.id) {
          await store.dispatch("lesson/setTargetsVisibleAllAction", false, { root: true });
          if (prevTargetsList.value.length && !studentOneAndOneId.value) {
            await store.dispatch("lesson/setTargetsVisibleListJoinedAction", prevTargetsList.value, { root: true });
            prevTargetsList.value = [];
          } else {
            await store.dispatch("lesson/setTargetsVisibleListJoinedAction", [], { root: true });
          }
        }
      }
    });
    watch(mediaTypeId, () => {
      if (mediaTypeId.value !== undefined && currentExposureItemMedia.value.image.url === "default") {
        store.dispatch("lesson/getAlternateMediaUrl", { token: loginInfo.access_token, id: currentExposureItemMedia.value.id });
      }
    });
    const { processPushShapes, addCircle, addSquare } = studentAddedShapes();
    const { processAnnotationLesson, processLessonImage } = annotationCurriculumStudent();
    const processCanvasWhiteboard = () => {
      if (isShowWhiteBoard.value) {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === "annotation-lesson" && obj.id !== "lesson-img"));
        canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
        if (group) {
          group.visible = false;
        }
      } else {
        canvas.setBackgroundColor("transparent", canvas.renderAll.bind(canvas));
        toolActive.value = "";
        canvas.isDrawingMode = false;
        processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard, true, null, group);
        if (group && isLessonPlan.value) {
          group.visible = true;
        }
      }
      canvas.renderAll();
    };
    watch(isShowWhiteBoard, () => {
      processCanvasWhiteboard();
    });
    const undoStrokeByTeacher = () => {
      if (undoCanvas.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type === "path" || obj.type === "polyline")
            .filter((obj: any) => obj.id === teacherForST.value?.id || obj.id === "pencil"),
        );
      }
    };
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
      if (canvasData.value && canvasData.value.length > 0 && (!studentOneAndOneId.value || studentOneAndOneId.value != student.value.id)) {
        renderStrokes(canvasData.value, null);
      }
    };
    watch(canvasData, async () => {
      await nextTick();
      if (!pencilPath.value.length) {
        renderTeacherStrokes();
      }
    });
    watch(
      laserPath,
      () => {
        laserPen(laserPath, canvas, oneOneStatus, studentOneAndOneId, student, scaleRatio.value);
      },
      { deep: true },
    );
    const studentSharingShapes = () => {
      if (studentShapes.value && studentShapes.value.length) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id !== student.value.id)
            .filter((obj: any) => obj.id !== teacherForST.value.id)
            .filter((obj: any) => obj.id !== "annotation-lesson" && obj.id !== "lesson-img")
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
            .filter(
              (obj: any) => obj.type !== "path" && obj.id !== teacherForST.value.id && obj.id !== "annotation-lesson" && obj.id !== "lesson-img",
            )
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
          ...canvas
            .getObjects()
            .filter(
              (obj: any) =>
                obj.type !== FabricObjectType.Path &&
                obj.type !== FabricObjectType.Text &&
                obj.id !== teacherForST.value.id &&
                obj.id !== "annotation-lesson" &&
                obj.id !== "lesson-img",
            ),
        );
      }
    });
    const teacherSharingShapes = (dataShapes: Array<UserShape>, studentOneId: string | null) => {
      if (dataShapes && dataShapes.length) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path")
            .filter((obj: any) => obj.id === teacherForST.value.id),
        );
        dataShapes.forEach((item) => {
          if (item.userId === teacherForST.value.id) {
            brushstrokesRender(canvas, item, studentOneId, "teacher-shapes");
          }
        });
      } else {
        canvas.remove(...canvas.getObjects().filter((obj: any) => obj.id === teacherForST.value.id && obj.tag === "teacher-shapes"));
      }
    };
    watch(
      teacherShapes,
      () => {
        teacherSharingShapes(teacherShapes.value, null);
      },
      { deep: true },
    );
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
      if (!pencilPath.value.length) {
        if (studentOneAndOneId.value === student.value.id) {
          undoStrokeByTeacherOneOne();
          renderOneTeacherStrokes();
        }
      }
    });
    const renderOneTeacherShapes = () => {
      if (studentOneAndOneId.value === student.value.id) {
        teacherSharingShapes(oneTeacherShapes.value, studentOneAndOneId.value);
      }
    };
    watch(
      oneTeacherShapes,
      () => {
        renderOneTeacherShapes();
      },
      { deep: true },
    );
    const selfStudentShapes = () => {
      if (studentShapes.value) {
        canvas.remove(
          ...canvas
            .getObjects()
            .filter((obj: any) => obj.id === student.value.id)
            .filter((obj: any) => obj.type !== "path" && obj.type !== "group"),
        );
        studentShapes.value.forEach((item: any) => {
          if (item.userId === student.value.id) {
            brushstrokesRender(canvas, item, null, "student-self-shapes");
          }
        });
        listenSelfStudent();
      }
    };
    watch(studentOneAndOneId, async () => {
      if (studentOneAndOneId.value) {
        oneOneIdNear.value = studentOneAndOneId.value;
        oneOneStatus.value = true;
        prevTargetsList.value = [...targetsList.value];
        prevZoomRatio.value = canvas.getZoom();
        prevZoomRatioByTeacher.value = zoomRatio.value;
        if (isLessonPlan.value && group) {
          prevCoords.value = {
            x: group.left,
            y: group.top,
          };
        }
        processCanvasWhiteboard();
        if (studentOneAndOneId.value !== student.value.id) {
          // disable shapes of student not 1-1
          canvas.isDrawingMode = false;
          canvas.discardActiveObject();
          canvas
            .getObjects()
            .filter((obj: any) => obj.type !== "path" && obj.type !== "group")
            .filter((obj: any) => obj.id !== studentOneAndOneId.value)
            .forEach((item: any) => {
              item.selectable = false;
              item.hasControls = false;
              item.hasBorders = false;
              item.hoverCursor = "cursor";
            });
        }
      } else {
        await store.dispatch("lesson/setTargetsVisibleListJoinedAction", prevTargetsList.value, { root: true });
        oneOneStatus.value = false;
        if (student.value.id === oneOneIdNear.value) {
          canvas.remove(...canvas.getObjects().filter((obj: any) => obj.isOneToOne !== null && obj.id !== "lesson-img"));
          if (!pencilPath.value.length) {
            undoStrokeByTeacher();
          }
          // render shapes objects again
          processCanvasWhiteboard();
          setTimeout(() => {
            targetsListProcess();
            teacherSharingShapes(teacherShapes.value, null);
            studentSharingShapes();
            selfStudentShapes();
            oneOneIdNear.value = "";
          }, 800);
          await store.dispatch("lesson/setZoomRatio", prevZoomRatioByTeacher.value, { root: true });
        }
        await store.dispatch("annotation/clearPencilPath");
        // enable shapes of each students
        listenSelfStudent();
        displayFabricItems(canvas, fabricItems.value);
      }
    });
    const listenToMouseDown = () => {
      canvas.on("mouse:down", (event: any) => {
        if (event.subTargets.length) processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard, false, event.subTargets[0], group);
      });
    };
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
      listenToMouseDown();
      listenToMouseUp();
      listenCreatedPath();
      listenSelfStudent();
      onObjectCreated(canvas);
    };
    const canvasRef = ref(null);
    const boardSetup = async () => {
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
      await FontLoader.load();
      listenToCanvasEvents();
      resizeCanvas();
      processCanvasWhiteboard();
    };
    const toggleTargets = computed(() => store.getters["lesson/showHideTargets"]);
    const targetsList = computed(() => store.getters["lesson/targetsAnnotationList"]);
    const prevTargetsList: Ref<any[]> = ref([]);
    const targetsListProcess = () => {
      if (targetsList.value?.length) {
        targetsList.value.forEach((obj: any) => {
          processAnnotationLesson(canvas, props.image, containerRef, isShowWhiteBoard, false, obj, group);
        });
      }
    };
    const firstTimeLoadTargets = ref(false);
    watch(
      targetsList,
      () => {
        targetsListProcess();
      },
      { deep: true },
    );
    const isImgProcessing = computed(() => store.getters["annotation/isImgProcessing"]);

    const imgLoad = async (e: Event) => {
      const img = e?.target as HTMLImageElement;
      if (img && img.naturalWidth && img.naturalHeight) {
        await store.dispatch("annotation/setImgDimension", { width: img.naturalWidth, height: img.naturalHeight });
      } else {
        await store.dispatch("annotation/setImgDimension", { width: undefined, height: undefined });
      }
      img.crossOrigin = "Anonymous";
      if (!isImgProcessing.value)
        group = processLessonImage(
          props.image,
          canvas,
          img,
          containerRef,
          isShowWhiteBoard.value,
          toggleTargets.value.visible,
          point,
          scaleRatio.value,
          !firstTimeLoadTargets.value,
        );
      if (!firstTimeLoadTargets.value && !isImgProcessing.value) {
        const lessonAnnotation = canvas
          .getObjects()
          .find((obj: any) => obj.id === "lesson-img")
          ._objects.filter((item: any) => item.id === "annotation-lesson")
          .map((item: any) => {
            return {
              userId: student.value.id,
              tag: item.tag,
              visible: item.stroke === "transparent" ? false : true,
            };
          });
        await store.dispatch("lesson/setTargetsVisibleListJoinedAction", lessonAnnotation, { root: true });
        firstTimeLoadTargets.value = true;
      }
    };
    const resizeCanvas = () => {
      const outerCanvasContainer = containerRef.value;
      if (!outerCanvasContainer || !outerCanvasContainer.clientWidth) return;
      const ratio = canvas.getWidth() / canvas.getHeight();
      const containerWidth = outerCanvasContainer.clientWidth;
      const scale = containerWidth / canvas.getWidth();
      const zoom = canvas.getZoom() * scale;
      scaleRatio.value = zoom;
      canvas.setDimensions({ width: containerWidth, height: containerWidth / ratio });
      canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
      point = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
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
    const funAddCircle = () => {
      return addCircle(canvas, toolActive, student, activeColor, studentOneAndOneId);
    };
    const funAddSquare = () => {
      return addSquare(canvas, toolActive, student, activeColor, studentOneAndOneId);
    };
    const paletteTools = [
      { name: "move", action: cursorHand },
      { name: "pen", action: addDraw },
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
      if (oneToOneUserId.value && oneToOneUserId.value === student.value.id) {
        return store.getters["annotation/fabricItemsOneToOne"];
      }
      return store.getters["annotation/fabricItems"];
    });

    watch(
      fabricItems,
      async (value) => {
        if (!lastFabricUpdated.value) {
          if (!oneToOneUserId.value || oneToOneUserId.value === student.value.id) {
            await canvas.remove(...canvas.getObjects().filter((obj: any) => obj.objectId && obj.id !== "lesson-img"));
          }
          displayFabricItems(canvas, value);
        }
      },
      { deep: true },
    );
    //receive the object lastFabricUpdated and update the whiteboard
    const lastFabricUpdated = computed(() => store.getters["annotation/lastFabricUpdated"]);
    const getObjectFromId = (id: string) => {
      const currentObjects = canvas.getObjects();
      return currentObjects.find((obj: any) => obj.objectId === id);
    };
    watch(lastFabricUpdated, async (value: LastFabricUpdated) => {
      if (!value) {
        return;
      }
      const { type, data } = value;
      switch (type) {
        case "create": {
          displayCreatedItem(canvas, data);
          await store.dispatch("annotation/setFabricObjects", data);
          break;
        }
        case "modify": {
          const existingObject = getObjectFromId(data.fabricId);
          if (!existingObject) {
            displayCreatedItem(canvas, data);
            await store.dispatch("annotation/setFabricObjects", data);
            break;
          }
          await store.dispatch("annotation/setFabricObjects", data);
          displayModifiedItem(canvas, data, existingObject);
          break;
        }
        default:
          break;
      }
    });
    watch(
      mediaState,
      () => {
        if (videoAnnotation.value) {
          mediaState.value === true ? videoAnnotation.value.play() : videoAnnotation.value.pause();
        }
        if (audioAnnotation.value) {
          mediaState.value === true ? audioAnnotation.value.play() : audioAnnotation.value.pause();
        }
      },
      { deep: true },
    );
    watch(
      currentTimeMedia,
      () => {
        if (videoAnnotation.value && currentTimeMedia.value) {
          videoAnnotation.value.currentTime = currentTimeMedia.value;
        }
        if (audioAnnotation.value && currentTimeMedia.value) {
          audioAnnotation.value.currentTime = currentTimeMedia.value;
        }
      },
      { deep: true },
    );

    watch(
      pencilPath,
      (value) => {
        if (value.length) {
          pencilPen(pencilPath.value, canvas, studentOneAndOneId.value, student.value, scaleRatio.value, zoomRatio.value);
        } else {
          undoStrokeByTeacher();
        }
      },
      { deep: true },
    );
    onMounted(() => {
      captureCanvas = document.getElementById("imgCanvas") as HTMLCanvasElement;
      boardSetup();
      window.addEventListener("resize", debounce(resizeCanvas, 300));
    });
    onUnmounted(() => {
      window.removeEventListener("resize", debounce(resizeCanvas, 300));
    });

    return {
      containerRef,
      pointerStyle,
      imageUrl,
      mediaTypeId,
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
      styles,
      videoAnnotation,
      audioAnnotation,
      isValidUrl,
    };
  },
});
