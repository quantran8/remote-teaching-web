import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
import { Exposure, ExposureStatus, ExposureType } from "@/store/lesson/state";
export default defineComponent({
  components: { LessonActivity, ExposureDetail },
  emits: ["open-gallery-mode"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const exposures = computed(() => getters["lesson/exposures"]);
    const activityStatistic = computed(() => getters["lesson/activityStatistic"]);
    const currentExposure = computed(() => getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => getters["lesson/currentExposureItemMedia"]);
    const progress = computed(() => getters["lesson/progressStatistic"]);
    const remainingTime = computed(() => getters["lesson/remainingTimeStatistic"]);
    const isGalleryView = computed(() => getters["teacherRoom/isGalleryView"]);

    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

    const onClickExposure = async (exposure: Exposure) => {
      if (exposure.id === currentExposure.value?.id || exposure.status === ExposureStatus.COMPLETED) return;
      if (currentExposure.value && currentExposure.value.type === ExposureType.TRANSITION) {
        await dispatch("teacherRoom/endExposure", {
          id: currentExposure.value.id,
        });
      }
      await dispatch("teacherRoom/setBlackOut", {
        isBlackOut: exposure.type === ExposureType.TRANSITION,
      });
      await dispatch("teacherRoom/setCurrentExposure", { id: exposure.id });
    };

    const onClickCloseExposure = async () => {
      await dispatch("teacherRoom/endExposure", {
        id: currentExposure.value.id,
      });
    };

    const isShowExposureDetail = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      return exposure && exposure.type !== ExposureType.TRANSITION;
    });

    return {
      isGalleryView,
      exposures,
      currentExposure,
      currentExposureItemMedia,
      progress,
      remainingTime,
      isShowExposureDetail,
      activityStatistic,
      onClickExposure,
      onClickCloseExposure,
      backToGalleryMode,
    };
  },
});
