import { Target } from "@/store/interactive/state";
import {
  Circle as CircleModel,
  Rectangle as RectangleModel,
} from "@/views/teacher-class/components/designate-target/designate-target";

import Circle from "../designate-circle/designate-circle.vue";
import Rectangle from "../designate-rectangle/designate-rectangle.vue";

import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";

export default defineComponent({
  components: {
    Circle,
    Rectangle,
  },
  props: ["targets", "image", "masked"],
  setup(props) {
    const scaleRatio = ref(1);
    const contentImageStyle = computed(() => {
      return props.image
        ? {
            "background-image": `url("${props.image.url}")`,
          }
        : {};
    });

    const touchPosition = ref({
      x: 0,
      y: 0,
    });
    const rectPreview = ref({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    const circles: Ref<Array<CircleModel>> = ref([]);
    const rectangles: Ref<Array<RectangleModel>> = ref([]);

    const updateTargets = () => {
      const targets: Array<Target> = props.targets;
      circles.value = targets
        .filter((t) => t.type === "circle")
        .map((c) => {
          return {
            id: c.id,
            x: rectPreview.value.x + c.x * scaleRatio.value,
            y: rectPreview.value.y + c.y * scaleRatio.value,
            color: c.color,
            radius: c.radius * scaleRatio.value,
            type: c.type,
          };
        });
      rectangles.value = targets
        .filter((t) => t.type === "rectangle")
        .map((r) => {
          return {
            id: r.id,
            x: rectPreview.value.x + r.x * scaleRatio.value,
            y: rectPreview.value.y + r.y * scaleRatio.value,
            color: r.color,
            type: r.type,
            width: r.width * scaleRatio.value,
            height: r.height * scaleRatio.value,
          };
        });
    };

    const updateTouchPosition = (x: number, y: number) => {
      console.log("updateTouchPosition", x, y);
    };

    const onClickExposureContent = (event: any) => {
      const parentElement = document.getElementById("exposure-content");
      if (!parentElement) return;
      const boundingBox = parentElement.getBoundingClientRect();
      touchPosition.value = {
        x:
          (event.x - boundingBox.left - rectPreview.value.x) / scaleRatio.value,
        y: (event.y - boundingBox.top - rectPreview.value.y) / scaleRatio.value,
      };
      updateTouchPosition(
        Math.floor(touchPosition.value.x),
        Math.floor(touchPosition.value.y)
      );
    };

    const touchStyle = computed(() => {
      return `transform: translate(${touchPosition.value.x}px,${touchPosition.value.y}px)`;
    });
    const rectPreviewStyle = computed(() => {
      return `left: ${rectPreview.value.x}px; top: ${rectPreview.value.y}px; width: ${rectPreview.value.width}px; height: ${rectPreview.value.height}px`;
    });

    const updateRectPreview = () => {
      const parentElement = document.getElementById("exposure-content");
      if (!parentElement) return;
      const boundingBox = parentElement.getBoundingClientRect();
      const { width, height } = props.image;

      if (!width || !height) return;
      const wRatio = boundingBox.width / width;
      const hRatio = boundingBox.height / height;

      const ratio = Math.min(wRatio, hRatio);
      scaleRatio.value = ratio;
      const rWidth = width * ratio;
      const rHeight = height * ratio;
      rectPreview.value.width = rWidth;
      rectPreview.value.height = rHeight;
      rectPreview.value.x = boundingBox.width / 2 - rWidth / 2;
      rectPreview.value.y = boundingBox.height / 2 - rHeight / 2;
      updateTargets();
    };

    updateRectPreview();

    watch(props, () => {
      updateRectPreview();
    });

    onMounted(() => {
      window.addEventListener("resize", updateRectPreview);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateRectPreview);
    });

    return {
      contentImageStyle,
      touchPosition,
      onClickExposureContent,
      touchStyle,
      rectPreviewStyle,
      circles,
      rectangles,
    };
  },
});
