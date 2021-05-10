import {
  computed,
  ComputedRef,
  defineComponent,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";
import interact from "interactjs";
import hammer from "hammerjs";
import { randomUUID } from "@/utils/utils";
import { StudentId, Target } from "@/store/interactive/state";
import StudentList from "./student-list/student-list.vue";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { MathUtils } from "@/utils/math.utils";
import { fabric } from "fabric";
import { Tools } from "@/commonui";
import ToolsCanvas from "@/components/common/annotation/tools/tools-canvas.vue";
import { Sticker } from "@/store/annotation/state";
import * as R from "ramda/";

export interface Shape {
  id: string;
  x: number;
  y: number;
  color: string;
  type: string;
  zIndex?: number;
}
export interface Circle extends Shape {
  radius: number;
}
export interface Rectangle extends Shape {
  width: number;
  height: number;
}

interface StudentViewModel {
  id: string;
  selected?: boolean;
  name: string;
  status: InClassStatus;
  index: number;
}

export default defineComponent({
  components: {
    StudentList,
    ToolsCanvas
  },
  props: {
    editable: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const store = useStore();
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const currentExposure = computed(
      () => store.getters["lesson/currentExposure"]
    );
    const nextExposureItemMedia = computed(
      () => store.getters["lesson/nextExposureItemMedia"]
    );
    const prevExposureItemMedia = computed(
      () => store.getters["lesson/prevExposureItemMedia"]
    );
    const designateTargets = computed(
      () => store.getters["interactive/targets"]
    );
    const circles: Ref<Array<Circle>> = ref([]);
    const rectangles: Ref<Array<Rectangle>> = ref([]);
    const addingRect: Ref<Rectangle | null> = ref(null);
    const addingCircle: Ref<Circle | null> = ref(null);
    const studentIds: Ref<Array<StudentViewModel>> = ref([]);
    const editing: Ref<boolean> = ref(false);
    const assignAll: Ref<boolean> = ref(true);
    const activeTab: Ref<string> = ref("designate-target-action");
    const students: ComputedRef<Array<StudentState>> = computed(
      () => store.getters["teacherRoom/students"]
    );
    let canvas: any;
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);
    const toolSelected: Ref<string> = ref("cursor");
    const strokeColor: Ref<string> = ref("#000000");
    const strokeWidth: Ref<number> = ref(2);
    const selectorOpen: Ref<boolean> = ref(false);
    const modeAnnotation: Ref<number> = ref(-1);
    const hasStickerTool: Ref<boolean> = ref(false);
    if (
      currentExposure.value.type == "poem" ||
      currentExposure.value.type == "bigbook"
    ) {
      hasStickerTool.value = true;
    }
    const boundingBox = () => {
      const designBox = document.getElementById("designate-box");
      return designBox?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0);
    };
    const calScaleRatio = () => {
      const { width, height } = currentExposureItemMedia.value.image;
      if (!width || !height) return 1;
      const boundingBoxRect = boundingBox();
      if (!boundingBoxRect.width) return 1;
      const wRatio = boundingBoxRect.width / width;
      const hRatio = boundingBoxRect.height / height;
      const ratio = Math.min(wRatio, hRatio);
      return ratio;
    };
    const calScaleRatioCanvas = () => {
      const { width, height } = currentExposureItemMedia.value.image;
      const rect = document.getElementById("canvas-container");
      if (!rect) return;
      const rectBounding = rect.getBoundingClientRect();
      const wRatio = rectBounding.width / width;
      const hRatio = rectBounding.height / height;
      const ratio = Math.min(wRatio, hRatio);
      return ratio;
    };
    const isTabActive = (menuItem: any) => {
      return activeTab.value === menuItem;
    };
    const setTabActive = async (menuItem: any) => {
      activeTab.value = menuItem;
      if (menuItem === "annotation-action") {
        if (selectorOpen.value && canvas.isDrawingMode) {
          modeAnnotation.value = 2;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value
          });
        } else {
          canvas.isDrawingMode = false;
          modeAnnotation.value = 1;
          await store.dispatch("teacherRoom/setMode", {
            mode: modeAnnotation.value
          });
          await store.dispatch("teacherRoom/setClearBrush", {});
        }
      } else {
        modeAnnotation.value = 0;
        await store.dispatch("teacherRoom/setMode", {
          mode: modeAnnotation.value
        });
      }
    };
    watch(isTabActive, setTabActive);
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
        drawing: lastObject
      });
    };
    const deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
    const img = document.createElement("img");
    img.src = deleteIcon;
    const deleteObject = (eventData: any, transform: any) => {
      const target = transform.target;
      const canvas = target.canvas;
      canvas.remove(target);
      canvas.requestRenderAll();
    };
    const renderIcon = (ctx: any, left: any, top: any, fabricObject: any) => {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
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
    const boardSetup = () => {
      canvas = new fabric.Canvas("canvasDesignate");
      const { width, height } = currentExposureItemMedia.value.image;
      canvas.setWidth(width - 146);
      canvas.setHeight(height - 104);
      canvas.selectionFullyContained = false;

      listenToCanvasEvents();
    };
    const addSticker = () => {
      const rect = new fabric.Rect({
        left: 10,
        top: 10,
        fill: strokeColor.value,
        width: 50,
        height: 75,
        objectCaching: false,
        opacity: 0.35,
        hasBorders: false,
        lockRotation: true
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
    };
    const assignSticker = async () => {
      const ratio = calScaleRatioCanvas();
      if (!ratio) return;
      const stickerFunc = R.pipe(
        R.map((obj: any) => R.assoc("width", obj.getScaledWidth())(obj)),
        R.map((obj: any) => R.assoc("height", obj.getScaledHeight())(obj)),
        R.project(["top", "left", "width", "height"]),
        R.map((obj: any) =>
          R.map((x: number) => Math.floor(x / ratio) - 1)(obj)
        )
      );
      const stickers = stickerFunc(canvas.getObjects("rect"));
      await store.dispatch("teacherRoom/setStickers", {
        stickers: stickers
      });
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
            mode: modeAnnotation.value
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
            mode: modeAnnotation.value
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
          return;
        case Tools.Clear:
          toolSelected.value = Tools.Clear;
          canvas.remove(...canvas.getObjects("path"));
          await store.dispatch("teacherRoom/setClearBrush", {});
          toolSelected.value = Tools.Pen;
          canvas.isDrawingMode = true;
          return;
        // case Tools.AddSticker:
        //   canvas.remove(...canvas.getObjects("path"));
        //   await store.dispatch("teacherRoom/setClearBrush", {});
        //   modeAnnotation.value = 3;
        //   await store.dispatch("teacherRoom/setMode", {
        //     mode: modeAnnotation.value
        //   });
        //   fabric.Rect.prototype.controls.deleteControl = new fabric.Control({
        //     x: 0.5,
        //     y: -0.5,
        //     offsetY: 16,
        //     cursorStyle: "pointer",
        //     mouseUpHandler: deleteObject,
        //     render: renderIcon,
        //     cornerSize: 24
        //   });
        //   addSticker();
        //   return;
        // case Tools.AssignSticker:
        //   canvas.renderAll();
        //   if (modeAnnotation.value === 3) {
        //     await assignSticker();
        //   }
        //   return;
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
    const textAssignAll = computed(() =>
      assignAll.value
        ? "Click to unassigned all students"
        : "Click to assign all students"
    );
    const touchStart = ref({ x: 0, y: 0 });
    const touchPosition = ref({ x: 0, y: 0 });

    const updateTargets = () => {
      const { width, height } = currentExposureItemMedia.value.image;
      const boundingBoxRect = boundingBox();
      const wRatio = boundingBoxRect.width / width;
      const hRatio = boundingBoxRect.height / height;
      const ratio = Math.min(wRatio, hRatio);
      const offsetX = (boundingBoxRect.width - ratio * width) / 2;
      const offsetY = (boundingBoxRect.height - ratio * height) / 2;
      const targets: Array<Target> = designateTargets.value;
      circles.value = targets
        .filter(t => t.type === "circle")
        .map(c => {
          return {
            id: c.id,
            x: offsetX + c.x * ratio,
            y: offsetY + c.y * ratio,
            color: c.color,
            radius: c.radius * ratio,
            type: c.type
          };
        });
      rectangles.value = targets
        .filter(t => t.type === "rectangle")
        .map(r => {
          return {
            id: r.id,
            x: offsetX + r.x * ratio,
            y: offsetY + r.y * ratio,
            color: r.color,
            type: r.type,
            width: r.width * ratio,
            height: r.height * ratio
          };
        });
    };

    const onClickToggleAssignAllStudents = () => {
      assignAll.value = !assignAll.value;
      studentIds.value = studentIds.value.map(s => {
        return {
          ...s,
          selected: assignAll.value
        };
      });
    };

    const updateStudentSelected = () => {
      const studentSelecteds: Array<StudentId> =
        store.getters["interactive/studentsSelected"];
      for (const st of studentSelecteds) {
        const student = studentIds.value.find(s => s.id === st.id);
        if (student) student.selected = true;
      }
    };

    watch(store.getters["interactive/studentsSelected"], updateStudentSelected);
    const onStudentsChanged = () => {
      if (studentIds.value.length) return;
      studentIds.value = students.value.map(s => {
        return {
          id: s.id,
          index: s.index,
          name: s.name,
          status: s.status,
          selected: true
        };
      });
      updateStudentSelected();
    };
    watch(students, onStudentsChanged);
    onStudentsChanged();

    const onClickToggleStudent = (s: StudentViewModel) => {
      studentIds.value = studentIds.value.map(st => {
        return {
          ...st,
          selected: s.id === st.id
        };
      });
    };

    const onClickAssignDesignate = async () => {
      if (props.editable || editing.value) {
        const ratio = calScaleRatio();
        const targets: Array<Target> = circles.value
          .map(c => {
            return {
              id: "",
              x: Math.floor(c.x / ratio),
              y: Math.floor(c.y / ratio),
              color: c.color,
              type: c.type,
              radius: Math.floor(c.radius / ratio),
              width: 0,
              height: 0,
              reveal: false
            };
          })
          .concat(
            rectangles.value.map(r => {
              return {
                id: "",
                x: Math.floor(r.x / ratio),
                y: Math.floor(r.y / ratio),
                color: r.color,
                type: r.type,
                radius: 0,
                width: Math.floor(r.width / ratio),
                height: Math.floor(r.height / ratio),
                reveal: false
              };
            })
          );

        const selectedStudents = studentIds.value
          .filter(s => s.selected)
          .map(s => s.id);
        const roomManager = await store.getters["teacherRoom/roomManager"];
        roomManager?.WSClient.sendRequestDesignateTarget(
          currentExposureItemMedia.value.id,
          targets,
          selectedStudents
        );
      }
    };
    const onClickCloseDesignate = async () => {
      await store.dispatch("interactive/setModalDesignateTarget", {
        modalDesignateTarget: false
      });
      modeAnnotation.value = 0;
      await store.dispatch("teacherRoom/setMode", {
        mode: modeAnnotation.value
      });
      toolSelected.value = "cursor";
      selectorOpen.value = false;
      strokeWidth.value = 2;
      strokeColor.value = "#000000";
      // canvas.isDrawingMode = false;
      // canvas.remove(...canvas.getObjects());
      canvas.dispose();
      await store.dispatch("teacherRoom/setClearBrush", {});
      await store.dispatch("teacherRoom/setClearStickers", {});
    };

    const resizable = () => {
      interact(`.rectangle`).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
          start(event: any) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find(ele => ele.id === targetId) ||
              circles.value.find(ele => ele.id === targetId);
            if (!ele) return;
            for (const e of rectangles.value) {
              e.zIndex = 0;
            }
            for (const e of circles.value) {
              e.zIndex = 0;
            }
            ele.zIndex = 1;
          },
          move: (event: any) => {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = event.target.id + "";
            if (targetId === "mediaImage") return;
            const rectangle = rectangles.value.find(ele => ele.id === targetId);
            if (!rectangle) return;
            rectangle.x = event.rect.left - boundingBox().left;
            rectangle.y = event.rect.top - boundingBox().top;
            rectangle.width = event.rect.width;
            rectangle.height = event.rect.height;
            rectangle.x = MathUtils.clamp(rectangle.x, 0, boundingBox().width);
            rectangle.y = MathUtils.clamp(rectangle.y, 0, boundingBox().height);
            if (rectangle.x + rectangle.width > boundingBox().width) {
              rectangle.width = boundingBox().width - rectangle.x;
            }
            if (rectangle.y + rectangle.height > boundingBox().height) {
              rectangle.height = boundingBox().height - rectangle.y;
            }
          }
        }
      });
      interact(`.circle`).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        modifiers: [
          interact.modifiers.aspectRatio({ enabled: true, equalDelta: true })
        ],
        listeners: {
          start(event: any) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find(ele => ele.id === targetId) ||
              circles.value.find(ele => ele.id === targetId);
            if (!ele) return;
            for (const e of rectangles.value) {
              e.zIndex = 0;
            }
            for (const e of circles.value) {
              e.zIndex = 0;
            }
            ele.zIndex = 1;
          },
          move: (event: any) => {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            if (targetId === "mediaImage") return;
            const circle = circles.value.find(ele => ele.id === targetId);
            if (!circle) return;
            const radius = event.rect.width / 2;
            circle.radius = radius;
            circle.x = event.rect.left - boundingBox().left + radius;
            circle.y = event.rect.top - boundingBox().top + radius;
          }
        }
      });
    };
    const draggable = () => {
      interact(`.draggable`).draggable({
        listeners: {
          start(event: any) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find(ele => ele.id === targetId) ||
              circles.value.find(ele => ele.id === targetId);
            if (!ele) return;
            for (const e of rectangles.value) {
              e.zIndex = 0;
            }
            for (const e of circles.value) {
              e.zIndex = 0;
            }
            ele.zIndex = 1;
          },
          move(event: any) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find(ele => ele.id === targetId) ||
              circles.value.find(ele => ele.id === targetId);
            if (!ele) return;
            ele.x += event.dx;
            ele.y += event.dy;
          },
          end(event: any) {
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find(ele => ele.id === targetId) ||
              circles.value.find(ele => ele.id === targetId);
            if (!ele) return;
            const topleft = { x: 0, y: 0 };
            const bottomRight = { x: 0, y: 0 };

            const rectangleElement = ele as Rectangle;

            if (rectangleElement) {
              topleft.x = rectangleElement.x;
              topleft.y = rectangleElement.y;
              bottomRight.x = rectangleElement.x + rectangleElement.width;
              bottomRight.y = rectangleElement.y + rectangleElement.height;
            } else {
              const circleElement = ele as Circle;
              if (circleElement) {
                topleft.x = circleElement.x - circleElement.radius;
                topleft.y = circleElement.y - circleElement.radius;
                bottomRight.x = circleElement.x + circleElement.radius;
                bottomRight.y = circleElement.y + circleElement.radius;
              }
            }
            const clientBoundingBox = boundingBox();
            const rect = {
              x: 0,
              y: 0,
              width: clientBoundingBox.width,
              height: clientBoundingBox.height
            };

            if (
              !MathUtils.isIntersect(rect, topleft) ||
              !MathUtils.isIntersect(rect, bottomRight)
            ) {
              const rectIndex = rectangles.value.findIndex(
                r => r.id === targetId
              );
              if (rectIndex !== -1) rectangles.value.splice(rectIndex, 1);
              const circleIndex = circles.value.findIndex(
                r => r.id === targetId
              );
              if (circleIndex !== -1) circles.value.splice(circleIndex, 1);
            }
          }
        }
      });
    };
    const init = () => {
      const designBox = document.getElementById("designate-box");
      if (!designBox) return;
      const manager = new hammer(designBox);
      manager.on("tap", (event: any) => {
        if (event.target.id !== "mediaImage") return;
        touchPosition.value.x = event.center.x - boundingBox().x - event.deltaX;
        touchPosition.value.y = event.center.y - boundingBox().y - event.deltaY;
        touchPosition.value.y = Math.max(touchPosition.value.y, 30);
        const circle = {
          id: Date.now() + "",
          x: touchPosition.value.x,
          y: touchPosition.value.y,
          radius: 30,
          color: "red",
          type: "circle",
          zIndex: 1
        };
        circles.value.push(circle);
      });
      manager.on("panstart", (event: any) => {
        addingRect.value = null;
        addingCircle.value = null;
        if (event.target.id !== "mediaImage") return;
        touchStart.value.x = event.center.x - boundingBox().x - event.deltaX;
        touchStart.value.y = event.center.y - boundingBox().y - event.deltaY;
        touchPosition.value.x = event.center.x - boundingBox().x;
        touchPosition.value.y = event.center.y - boundingBox().y;
        if (event.srcEvent.altKey) {
          const x = touchStart.value.x;
          const y = touchStart.value.y;
          addingCircle.value = {
            id: randomUUID(),
            x: x,
            y: y,
            radius: 0,
            color: "red",
            type: "circle",
            zIndex: 1
          };
        } else {
          const x = Math.min(touchStart.value.x, touchPosition.value.x);
          const y = Math.min(touchStart.value.y, touchPosition.value.y);
          const width = Math.abs(touchPosition.value.x - touchStart.value.x);
          const height = Math.abs(touchPosition.value.y - touchStart.value.y);
          addingRect.value = {
            id: randomUUID(),
            x: x,
            y: y,
            width: width,
            height: height,
            color: "green",
            type: "rectangle",
            zIndex: 1
          };
        }
      });
      manager.on("panmove", (event: any) => {
        if (!addingRect.value && !addingCircle.value) return;
        touchPosition.value.x = MathUtils.clamp(
          event.center.x - boundingBox().x,
          0,
          boundingBox().width
        );
        touchPosition.value.y = MathUtils.clamp(
          event.center.y - boundingBox().y,
          0,
          boundingBox().height
        );
        if (addingRect.value) {
          const x = Math.min(touchStart.value.x, touchPosition.value.x);
          const y = Math.min(touchStart.value.y, touchPosition.value.y);
          const width = Math.abs(touchPosition.value.x - touchStart.value.x);
          const height = Math.abs(touchPosition.value.y - touchStart.value.y);
          addingRect.value.x = x;
          addingRect.value.y = y;
          addingRect.value.width = width;
          addingRect.value.height = height;
        } else if (addingCircle.value) {
          const x = touchStart.value.x / 2 + touchPosition.value.x / 2;
          const y = touchStart.value.y / 2 + touchPosition.value.y / 2;
          addingCircle.value.x = x;
          addingCircle.value.y = y;
          addingCircle.value.radius =
            MathUtils.distance(touchStart.value, touchPosition.value) / 2;
        }
      });
      manager.on("panend", (_: any) => {
        if (addingRect.value) {
          rectangles.value.push({ ...addingRect.value });
          addingRect.value = null;
        }
        if (addingCircle.value) {
          circles.value.push({ ...addingCircle.value });
          addingCircle.value = null;
        }
      });
      resizable();
      draggable();
    };
    const onClickClearAllTargets = () => {
      circles.value = [];
      rectangles.value = [];
      editing.value = true;
      init();
    };
    const onClickRevealAllTargets = async () => {
      const roomManager = await store.getters["teacherRoom/roomManager"];
      roomManager?.WSClient.sendRequestAnswerAll();
    };
    const onClickNextPrevMedia = async (nextPrev: number) => {
      onClickClearAllTargets();
      await store.dispatch("interactive/setTargets", {
        targets: []
      });
      await store.dispatch("interactive/setLocalTargets", {
        targets: []
      });
      await setTabActive("designate-target-action");
      toolSelected.value = "cursor";
      selectorOpen.value = false;
      strokeWidth.value = 2;
      strokeColor.value = "#000000";
      canvas.isDrawingMode = false;
      canvas.remove(...canvas.getObjects());
      await store.dispatch("teacherRoom/setClearBrush", {});
      await store.dispatch("teacherRoom/setClearStickers", {});
      if (nextPrev === 1) {
        if (nextExposureItemMedia.value !== undefined) {
          await store.dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: nextExposureItemMedia.value.id
          });
        }
      } else {
        if (prevExposureItemMedia.value !== undefined) {
          await store.dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: prevExposureItemMedia.value.id
          });
        }
      }
    };
    const onLoaded = (evt: any) => {
      updateTargets();
    };
    onMounted(() => {
      if (props.editable) init();
      window.addEventListener("resize", updateTargets);
      boardSetup();
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateTargets);
    });

    return {
      students,
      onClickCloseDesignate,
      currentExposureItemMedia,
      nextExposureItemMedia,
      prevExposureItemMedia,
      addingCircle,
      circles,
      rectangles,
      addingRect,
      touchStart,
      touchPosition,
      init,
      studentIds,
      onClickToggleStudent,
      onClickClearAllTargets,
      designateTargets,
      updateTargets,
      onLoaded,
      onClickRevealAllTargets,
      onClickToggleAssignAllStudents,
      textAssignAll,
      isTabActive,
      setTabActive,
      clickedTool,
      cursorPosition,
      toolNames,
      toolSelected,
      selectorOpen,
      strokeWidth,
      strokeColor,
      updateColorValue,
      updateStrokeWidth,
      onClickAssignDesignate,
      onClickNextPrevMedia,
      hasStickerTool
    };
  }
});
