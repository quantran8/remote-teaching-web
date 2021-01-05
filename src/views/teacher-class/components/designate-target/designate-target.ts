import { computed, ComputedRef, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import interact from "interactjs";
import hammer from "hammerjs";
import Circle from "./circle/circle.vue";
import Rectangle from "./rectangle/rectangle.vue";
import { randomUUID } from "@/utils/utils";
import { StudentId, Target } from "@/store/interactive/state";
import StudentList from "./student-list/student-list.vue";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { MathUtils } from "@/utils/math.utils";
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
    Circle,
    Rectangle,
    StudentList,
  },
  mounted() {
    const store = useStore();
    const targets = store.getters["interactive/targets"];
    if (!targets.length) this.init();
  },
  setup() {
    const store = useStore();
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const circles: Ref<Array<Circle>> = ref([]);
    const rectangles: Ref<Array<Rectangle>> = ref([]);
    const addingRect: Ref<Rectangle | null> = ref(null);
    const addingCircle: Ref<Circle | null> = ref(null);
    const studentIds: Ref<Array<StudentViewModel>> = ref([]);
    const students: ComputedRef<Array<StudentState>> = computed(
      () => store.getters["teacherRoom/students"]
    );
    const touchStart = ref({ x: 0, y: 0 });
    const touchPosition = ref({ x: 0, y: 0 });

    const updateTargets = () => {
      const targets: Array<Target> = store.getters["interactive/targets"];
      circles.value = targets
        .filter((t) => t.type === "circle")
        .map((c) => {
          return {
            id: c.id,
            x: c.x,
            y: c.y,
            color: c.color,
            radius: c.radius,
            type: c.type,
          };
        });
      rectangles.value = targets
        .filter((t) => t.type === "rectangle")
        .map((r) => {
          return {
            id: r.id,
            x: r.x,
            y: r.y,
            color: r.color,
            type: r.type,
            width: r.width,
            height: r.height,
          };
        });
    };
    watch(store.getters["interactive/targets"], updateTargets);
    updateTargets();
    const updateStudentSelected = () => {
      const studentSelecteds: Array<StudentId> =
        store.getters["interactive/studentsSelected"];
      for (const st of studentSelecteds) {
        const student = studentIds.value.find((s) => s.id === st.id);
        if (student) student.selected = true;
      }
    };

    watch(store.getters["interactive/studentsSelected"], updateStudentSelected);
    const onStudentsChanged = () => {
      if (studentIds.value.length) return;
      studentIds.value = students.value.map((s) => {
        return {
          id: s.id,
          index: s.index,
          name: s.name,
          status: s.status,
          selected: false,
        };
      });
      updateStudentSelected();
    };
    watch(students, onStudentsChanged);
    onStudentsChanged();

    const onClickToggleStudent = (s: StudentViewModel) => {
      const student = studentIds.value.find((ele) => ele.id === s.id);
      if (student) student.selected = !student.selected;
    };

    const onClickCloseDesignate = async () => {
      await store.dispatch("interactive/setDesignatingTarget", {
        isDesignatingTarget: false,
      });

      const targets: Array<Target> = circles.value
        .map((c) => {
          return {
            id: "",
            x: Math.floor(c.x),
            y: Math.floor(c.y),
            color: c.color,
            type: c.type,
            radius: Math.floor(c.radius),
            width: 0,
            height: 0,
            reveal: false,
          };
        })
        .concat(
          rectangles.value.map((r) => {
            return {
              id: "",
              x: Math.floor(r.x),
              y: Math.floor(r.y),
              color: r.color,
              type: r.type,
              radius: 0,
              width: Math.floor(r.width),
              height: Math.floor(r.height),
              reveal: false,
            };
          })
        );

      const selectedStudents = studentIds.value
        .filter((s) => s.selected)
        .map((s) => s.id);
      const roomManager = await store.getters["teacherRoom/roomManager"];
      roomManager?.WSClient.sendRequestDesignateTarget(
        currentExposureItemMedia.value.id,
        targets,
        selectedStudents
      );
    };

    const boundingBox = () => {
      const designBox = document.getElementById("designate-box");
      return designBox?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0);
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
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
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
            const rectangle = rectangles.value.find(
              (ele) => ele.id === targetId
            );
            if (!rectangle) return;
            rectangle.x = event.rect.left - boundingBox().left;
            rectangle.y = event.rect.top - boundingBox().top;
            rectangle.width = event.rect.width;
            rectangle.height = event.rect.height;
          },
        },
      });
      interact(`.circle`).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        modifiers: [
          interact.modifiers.aspectRatio({ enabled: true, equalDelta: true }),
        ],
        listeners: {
          start(event: any) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
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
            const circle = circles.value.find((ele) => ele.id === targetId);
            if (!circle) return;
            const radius = event.rect.width / 2;
            circle.radius = radius;
            circle.x = event.rect.left - boundingBox().left + radius;
            circle.y = event.rect.top - boundingBox().top + radius;
          },
        },
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
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
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
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
            if (!ele) return;
            ele.x += event.dx;
            ele.y += event.dy;
          },
          end(event: any) {
            const targetId = `${event.target.id}`;
            const ele =
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
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
              height: clientBoundingBox.height,
            };

            if (
              !MathUtils.isIntersect(rect, topleft) ||
              !MathUtils.isIntersect(rect, bottomRight)
            ) {
              const rectIndex = rectangles.value.findIndex(
                (r) => r.id === targetId
              );
              if (rectIndex !== -1) rectangles.value.splice(rectIndex, 1);
              const circleIndex = circles.value.findIndex(
                (r) => r.id === targetId
              );
              if (circleIndex !== -1) circles.value.splice(circleIndex, 1);
            }
          },
        },
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
        const circle = {
          id: Date.now() + "",
          x: touchPosition.value.x,
          y: touchPosition.value.y,
          radius: 30,
          color: "red",
          type: "circle",
          zIndex: 1,
        };
        circles.value.push(circle);
      });
      manager.on("panstart", (event: any) => {
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
            zIndex: 1,
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
            zIndex: 1,
          };
        }
      });
      manager.on("panmove", (event: any) => {
        if (!addingRect.value && !addingCircle.value) return;
        touchPosition.value.x = event.center.x - boundingBox().x;
        touchPosition.value.y = event.center.y - boundingBox().y;
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
        if (!addingCircle.value && !addingRect.value) return;
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
      init();
    };

    return {
      students,
      onClickCloseDesignate,
      currentExposureItemMedia,
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
    };
  },
});
