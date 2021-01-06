import { Target, StudentId } from "@/store/interactive/state";
import { ExposureItemMedia } from "@/store/lesson/state";
import { ClassView } from "@/store/room/interface";
import { useRoute } from "vue-router";
import {
  Circle as CircleModel,
  Rectangle as RectangleModel,
} from "@/views/teacher-class/components/designate-target/designate-target";

import Circle from "@/views/teacher-class/components/designate-target/circle/circle.vue";
import Rectangle from "@/views/teacher-class/components/designate-target/rectangle/rectangle.vue";

import {
  computed,
  ComputedRef,
  defineComponent,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    Circle,
    Rectangle,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { studentId } = route.params;
    const isLessonPlan = computed(
      () => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN
    );
    const isBlackOutContent = computed(
      () => store.getters["lesson/isBlackOut"]
    );
    const contentViewElement = computed(() =>
      document.getElementById("content-view")
    );

    const updateStudentSelected = () => {
      const studentSelecteds: Array<StudentId> =
        store.getters["interactive/studentsSelected"];
      const student = studentSelecteds.find((s) => s.id === studentId);
      if (student) console.log(studentId, "assigned");
    };

    updateStudentSelected();

    const scaleRatio = ref(1);

    const currentExposureItemMedia: ComputedRef<
      ExposureItemMedia | undefined
    > = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const contentImageStyle = computed(() => {
      return currentExposureItemMedia.value
        ? {
            "background-image": `url("${currentExposureItemMedia.value.image.url}")`,
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
    const targets: ComputedRef<Array<Target>> = computed(
      () => store.getters["interactive/targets"]
    );
    const isAssigned = computed(() => store.getters["interactive/isAssigned"]);

    const updateTargets = () => {
      if (!isAssigned.value) {
        circles.value = [];
        rectangles.value = [];
        return;
      }
      circles.value = targets.value
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
      rectangles.value = targets.value
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

      console.log("updateTarget", rectangles.value, circles.value);
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
      if (!currentExposureItemMedia.value) return;
      const parentElement = document.getElementById("exposure-content");
      if (!parentElement) return;
      const boundingBox = parentElement.getBoundingClientRect();
      const { width, height } = currentExposureItemMedia.value.image;

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

    watch([currentExposureItemMedia, contentViewElement, targets], () => {
      if (currentExposureItemMedia.value) updateRectPreview();
    });

    onMounted(() => {
      window.addEventListener("resize", updateRectPreview);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateRectPreview);
    });

    return {
      isBlackOutContent,
      contentImageStyle,
      isLessonPlan,
      touchPosition,
      onClickExposureContent,
      touchStyle,
      rectPreviewStyle,
      circles,
      rectangles,
    };
  },
});
