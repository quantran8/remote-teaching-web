import { computed, ComputedRef, defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import interact from "interactjs";
import hammer from "hammerjs";
import Circle from "./circle/circle.vue";
import Rectangle from "./rectangle/rectangle.vue";
export interface Shape {
  id: string;
  x: number;
  y: number;
  color: string;
  type: string;
}
export interface Circle extends Shape {
  radius: number;
}
export interface Rectangle extends Shape {
  width: number;
  height: number;
}

export default defineComponent({
  components: {
    Circle,
    Rectangle,
  },
  setup() {
    const store = useStore();
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const onClickCloseDesignate = () => {
      store.dispatch("teacherRoom/setDesignatingTarget", {
        isDesignatingTarget: false,
      });
    };
    const boundingBox = () => {
      const designBox = document.getElementById("designate-box");
      return designBox?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0);
    };
    const shapes: Ref<Array<Shape>> = ref([]);
    const circles: Ref<Array<Circle>> = ref([]);
    const rectangles: Ref<Array<Rectangle>> = ref([]);
    const addingRect: Ref<Rectangle | null> = ref(null);
    const previewRect: Ref<Rectangle | null> = ref(null);
    const previewCircle: Ref<Circle | null> = ref(null);
    const addingCircle: Ref<Circle | null> = ref(null);

    const touchStart = ref({
      x: 0,
      y: 0,
    });
    const touchPosition = ref({
      x: 0,
      y: 0,
    });

    const distance = (
      p1: { x: number; y: number },
      p2: { x: number; y: number }
    ) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const resizable = () => {
      interact(`.resizable`).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
          move: (event) => {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = event.target.id + "";
            if (targetId === "mediaImage") {
              return;
            }
            const rect = rectangles.value.find((ele) => ele.id === targetId);
            if (rect) {
              rect.x = event.rect.left - boundingBox().left;
              rect.y = event.rect.top - boundingBox().top;
              rect.width = event.rect.width;
              rect.height = event.rect.height;
            }
            const circle = circles.value.find((ele) => ele.id === targetId);
            if (circle) {
              const x = event.rect.left - boundingBox().left;
              const y = event.rect.top - boundingBox().top;
              const diameter =
                Math.abs(event.delta.x) >= Math.abs(event.delta.y)
                  ? event.rect.width
                  : event.rect.height;
              circle.x = x + diameter / 2;
              circle.y = y + diameter / 2;
              circle.radius = diameter / 2;
            }
          },
        },
      });
    };
    const draggable = () => {
      interact(`.draggable`).draggable({
        listeners: {
          move(event) {
            addingCircle.value = null;
            addingRect.value = null;
            const targetId = event.target.id + "";
            const ele =
              rectangles.value.find((ele) => ele.id === targetId) ||
              circles.value.find((ele) => ele.id === targetId);
            if (!ele) return;
            ele.x += event.dx;
            ele.y += event.dy;
          },
        },
      });
    };
    const onClickDesignBox = (event: any) => {
      if (event.target.id === "mediaImage") {
        const circle = {
          id: Date.now() + "",
          x: event.offsetX,
          y: event.offsetY,
          radius: 20,
          color: "red",
          type: "circle",
        };
        circles.value.push(circle);
        resizable();
        draggable();
      }
    };
    const onClickCircle = (circle: any) => {
      console.log(circle);
    };
    const onClickRectangle = (rect: any) => {
      console.log(rect);
    };

    const init = () => {
      const designBox = document.getElementById("designate-box");
      if (!designBox) return;
      const manager = new hammer(designBox);
      manager.on("tap", (event) => {
        touchPosition.value.x = event.center.x - boundingBox().x - event.deltaX;
        touchPosition.value.y = event.center.y - boundingBox().y - event.deltaY;
        const circle = {
          id: Date.now() + "",
          x: touchPosition.value.x,
          y: touchPosition.value.y,
          radius: 20,
          color: "red",
          type: "circle",
          style: `transform: translate(${touchPosition.value.x}px,${touchPosition.value.y}px)`,
        };
        circles.value.push(circle);
      });
      manager.on("panstart", (event: HammerInput) => {
        if (event.target.id !== "mediaImage") return;
        touchStart.value.x = event.center.x - boundingBox().x - event.deltaX;
        touchStart.value.y = event.center.y - boundingBox().y - event.deltaY;
        touchPosition.value.x = event.center.x - boundingBox().x;
        touchPosition.value.y = event.center.y - boundingBox().y;
        if (event.srcEvent.altKey) {
          const x = touchStart.value.x;
          const y = touchStart.value.y;
          const radius = distance(touchStart.value, touchPosition.value);
          addingCircle.value = {
            id: Date.now() + "",
            x: x,
            y: y,
            radius: radius,
            color: "red",
            type: "circle",
          };
        } else {
          const x = Math.min(touchStart.value.x, touchPosition.value.x);
          const y = Math.min(touchStart.value.y, touchPosition.value.y);
          const width = Math.abs(touchPosition.value.x - touchStart.value.x);
          const height = Math.abs(touchPosition.value.y - touchStart.value.y);
          addingRect.value = {
            id: Date.now() + "",
            x: x,
            y: y,
            width: width,
            height: height,
            color: "red",
            type: "rectangle",
          };
        }
      });
      manager.on("panmove", (event) => {
        if (!addingRect.value && !addingCircle.value) return;
        const boundingBox = designBox.getBoundingClientRect();
        touchPosition.value.x = event.center.x - boundingBox.x;
        touchPosition.value.y = event.center.y - boundingBox.y;
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
            distance(touchStart.value, touchPosition.value) / 2;
        }
      });
      manager.on("panend", (_) => {
        if (!addingCircle.value && !addingRect.value) return;
        if (addingRect.value) {
          rectangles.value.push({ ...addingRect.value });
          addingRect.value = null;
        }
        if (addingCircle.value) {
          circles.value.push({ ...addingCircle.value });
          addingCircle.value = null;
        }
        resizable();
        draggable();
      });
    };

    setTimeout(init, 300);

    return {
      onClickCloseDesignate,
      onClickDesignBox,
      currentExposureItemMedia,
      addingCircle,
      circles,
      onClickCircle,
      rectangles,
      addingRect,
      onClickRectangle,
      touchStart,
      touchPosition,
      shapes,
      previewRect,
      previewCircle,
    };
  },
});
