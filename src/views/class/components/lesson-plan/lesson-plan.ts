import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
export default defineComponent({
  components: { LessonActivity, ExposureDetail },
  setup() {
    const { getters, dispatch } = useStore();
    const exposures = computed(() => getters["lesson/exposures"]);
    const currentExposure = computed(() => getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(
      () => getters["lesson/currentExposureItemMedia"]
    );

    const totalActivities = 10;
    const progress = 0.4;
    const remainingTime = "42:00";

    const setCurrentExposure = async (id: string) => {
      await dispatch("lesson/setCurrentExposure", { id: id });
    };

    const onClickCloseExposure = async () => {
      return setCurrentExposure("");
    };

    return {
      exposures,
      currentExposure,
      currentExposureItemMedia,
      progress,
      totalActivities,
      remainingTime,
      setCurrentExposure,
      onClickCloseExposure
    };
  },
});
