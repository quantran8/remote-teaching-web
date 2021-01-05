import { ClassView } from "@/store/room/interface";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const isLessonPlan = computed(
      () => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN
    );
    const isBlackOutContent = computed(
      () => store.getters["lesson/isBlackOut"]
    );
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const contentImageStyle = computed(() => {
      return currentExposureItemMedia.value
        ? {
            "background-image": `url("${currentExposureItemMedia.value.image.url}")`,
          }
        : {};
    });
    return { isBlackOutContent, contentImageStyle, isLessonPlan };
  },
});
