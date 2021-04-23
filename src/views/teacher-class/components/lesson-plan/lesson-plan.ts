import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
import { Exposure, ExposureStatus, ExposureType } from "@/store/lesson/state";
import IconNext from "@/assets/images/arrow.png";
import IconNextDisable from "@/assets/images/arrow-disable.png";

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
    const nextExposureItemMedia = computed(() => getters["lesson/nextExposureItemMedia"]);
    const page = computed(() => getters["lesson/getPage"]);
    const iconNext = ref(IconNextDisable);

    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

    const onClickExposure = async (exposure: Exposure) => {
      if (exposure.id === currentExposure.value?.id || exposure.status === ExposureStatus.COMPLETED) return;
      if (currentExposure.value && currentExposure.value.type === ExposureType.TRANSITION) {
        await dispatch("teacherRoom/endExposure", {
          id: currentExposure.value.id,
        });
        await dispatch("teacherRoom/setBlackOut", {
          isBlackOut: true,
        });
      }
      await dispatch("teacherRoom/setBlackOut", {
        isBlackOut: false,
      });
      await dispatch("teacherRoom/setCurrentExposure", { id: exposure.id });
      await dispatch("teacherRoom/setMode", {
        mode: 1,
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    const onClickCloseExposure = async () => {
      await dispatch("teacherRoom/endExposure", {
        id: currentExposure.value.id,
      });
      await dispatch("teacherRoom/setBlackOut", {
        isBlackOut: true,
      });
      await dispatch("teacherRoom/setMode", {
        mode: 0,
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    const onClickNextMedia = async () => {
      if (nextExposureItemMedia.value !== undefined) {
        await dispatch("interactive/setTargets", {
          targets: [],
        });
        await dispatch("interactive/setLocalTargets", {
          targets: [],
        });
        await dispatch("teacherRoom/setClearBrush", {});
        await dispatch("teacherRoom/setClearStickers", {});
        if (nextExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: nextExposureItemMedia.value.id,
          });
        }
      }
    };

    watch(nextExposureItemMedia, () => {
      if (nextExposureItemMedia.value !== undefined) {
        iconNext.value = IconNext;
      } else {
        iconNext.value = IconNextDisable;
      }
    });

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
      page,
      onClickNextMedia,
      nextExposureItemMedia,
      iconNext,
    };
  },
});
