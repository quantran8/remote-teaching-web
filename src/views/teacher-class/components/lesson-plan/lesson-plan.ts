import { computed, defineComponent, ref, watch, onBeforeUnmount, onBeforeMount, onUnmounted } from "vue";
import { useStore } from "vuex";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
import { Exposure, ExposureStatus, ExposureType } from "@/store/lesson/state";
import IconNext from "@/assets/images/arrow.png";
import IconNextDisable from "@/assets/images/arrow-disable.png";
import { ClassView } from "@/store/room/interface";
import { NEXT_EXPOSURE, PREV_EXPOSURE } from "@/utils/constant";

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
    const prevExposureItemMedia = computed(() => getters["lesson/prevExposureItemMedia"]);
    const page = computed(() => getters["lesson/getPage"]);
    const iconNext = ref(IconNextDisable);
    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

    const nextCurrentExposuse = ref(null);
    const prevCurrentExposuse = ref(null);

    watch(currentExposure, () => {
      const currentExposureIndex = exposures.value.findIndex((item: any) => {
        return item.id === currentExposure.value?.id;
      });
      const nextCurrentExposuseIndex = currentExposureIndex + 1;
      const prevCurrentExposuseIndex = currentExposureIndex - 1;
      nextCurrentExposuse.value = exposures.value[nextCurrentExposuseIndex];
      prevCurrentExposuse.value = exposures.value[prevCurrentExposuseIndex];
    });

    const onClickExposure = async (exposure: Exposure | null) => {
      if (!exposure) return;
      if (exposure.id === currentExposure.value?.id) return;
      if (currentExposure.value && currentExposure.value.type === ExposureType.TRANSITION) {
        await dispatch("teacherRoom/endExposure", {
          id: currentExposure.value.id,
        });
      }
      await dispatch("teacherRoom/setBlackOut", {
        isBlackOut: exposure.type === ExposureType.TRANSITION,
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

    const onClickPrevNextMedia = async (nextPrev: number) => {
      await dispatch("interactive/setTargets", {
        targets: [],
      });
      await dispatch("interactive/setLocalTargets", {
        targets: [],
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setClearStickers", {});
      if (nextPrev === NEXT_EXPOSURE) {
        if (nextExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: nextExposureItemMedia.value.id,
          });
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(nextCurrentExposuse.value);
        }
      } else {
        if (prevExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: prevExposureItemMedia?.value?.id,
          });
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(prevCurrentExposuse.value);
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

    const isLessonPlan = computed(() => getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const handleKeyDown = (e: any) => {
      if (e.key == "ArrowRight" || e.key == "ArrowDown") {
        onClickPrevNextMedia(NEXT_EXPOSURE);
      } else if (e.key == "ArrowLeft" || e.key == "ArrowUp") {
        onClickPrevNextMedia(PREV_EXPOSURE);
      }
    };
    onBeforeMount(() => {
      window.addEventListener("keydown", handleKeyDown);
    });

    onUnmounted( () => {
      window.removeEventListener("keydown", handleKeyDown);
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
      onClickPrevNextMedia,
      nextExposureItemMedia,
      iconNext,
      NEXT_EXPOSURE,
    };
  },
});
