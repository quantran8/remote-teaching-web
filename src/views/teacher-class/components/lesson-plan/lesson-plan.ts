import { TeacherClassLessonPlan } from "@/locales/localeid";
import { computed, defineComponent, ref, watch, onUnmounted, onMounted } from "vue";
import { useStore } from "vuex";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
import { Exposure, ExposureStatus, ExposureType } from "@/store/lesson/state";
import IconNext from "@/assets/images/arrow.png";
import IconNextDisable from "@/assets/images/arrow-disable.png";
import { ClassView } from "@/store/room/interface";
import { NEXT_EXPOSURE, PREV_EXPOSURE } from "@/utils/constant";
import { fmtMsg } from "@/commonui";

export const exposureTypes = {
  VCP_BLOCK: "VPC_BLOCK",
  CONTENT_BLOCK: "CONTENT_BLOCK",
  TEACHING_ACTIVITY_BLOCK: "TEACHING_ACTIVITY_BLOCK",
};

export default defineComponent({
  components: { LessonActivity, ExposureDetail },
  emits: ["open-gallery-mode"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();

    const unitText = computed(() => fmtMsg(TeacherClassLessonPlan.Unit));
    const lessonText = computed(() => fmtMsg(TeacherClassLessonPlan.Lesson));
    const remainingText = computed(() => fmtMsg(TeacherClassLessonPlan.Remaining));
    const itemText = computed(() => fmtMsg(TeacherClassLessonPlan.Item));
    const pageText = computed(() => fmtMsg(TeacherClassLessonPlan.Page));

    const exposures = computed(() => getters["lesson/exposures"]);
    const activityStatistic = computed(() => getters["lesson/activityStatistic"]);
    const currentExposure = computed(() => getters["lesson/currentExposure"]);
    const currentLesson = computed(() => getters["teacherRoom/currentLesson"]);
    const currentUnit = computed(() => getters["teacherRoom/currentUnit"]);
    const currentExposureItemMedia = computed(() => getters["lesson/currentExposureItemMedia"]);
    const progress = computed(() => getters["lesson/progressStatistic"]);
    const remainingTime = computed(() => getters["lesson/remainingTimeStatistic"]);
    const isGalleryView = computed(() => getters["teacherRoom/isGalleryView"]);
    const nextExposureItemMedia = computed(() => getters["lesson/nextExposureItemMedia"]);
    const prevExposureItemMedia = computed(() => getters["lesson/prevExposureItemMedia"]);
    const page = computed(() => getters["lesson/getPage"]);
    const iconNext = ref(IconNextDisable);
    const canNext = ref(true);
    const canPrev = ref(false);

    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

    const nextCurrentExposure = ref(null);
    const prevCurrentExposure = ref(null);

    watch(currentExposure, () => {
      const currentExposureIndex = exposures.value.findIndex((item: any) => {
        return item.id === currentExposure.value?.id;
      });
      const nextCurrentExposureIndex = currentExposureIndex + 1;
      const prevCurrentExposureIndex = currentExposureIndex - 1;
      nextCurrentExposure.value = exposures.value[nextCurrentExposureIndex];
      prevCurrentExposure.value = exposures.value[prevCurrentExposureIndex];
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
      const firstItemMediaNewExposureId = [...exposure.items, ...exposure.contentBlockItems, ...exposure.teachingActivityBlockItems].filter(
        item => item.media[0]?.image?.url,
      )[0]?.id;

      await dispatch("teacherRoom/setMode", {
        mode: 1,
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setCurrentExposureMediaItem", {
        id: firstItemMediaNewExposureId,
      });
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

    const isLessonPlan = computed(() => getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const onClickPrevNextMedia = async (nextPrev: number) => {
      if (!isLessonPlan.value) return;
      await dispatch("interactive/setTargets", {
        targets: [],
      });
      await dispatch("interactive/setLocalTargets", {
        targets: [],
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setClearStickers", {});
      if (nextPrev === NEXT_EXPOSURE) {
        if (!canNext.value) return;
        if (nextExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: nextExposureItemMedia.value.id,
          });
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(nextCurrentExposure.value);
        }
      } else {
        if (!canPrev.value) return;
        if (prevExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: prevExposureItemMedia?.value?.id,
          });
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(prevCurrentExposure.value);
        }
      }
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    watch(page, () => {
      const itemArr = activityStatistic.value.split("/");
      const pageArr = page.value.split("/");
      if (+itemArr[0] == 0 || (+itemArr[0] == 1 && +pageArr[0] == 1)) {
        canPrev.value = false;
      } else {
        canPrev.value = true;
      }
      if (+itemArr[0] == 0 || (+itemArr[0] == +itemArr[1] && +pageArr[0] == +pageArr[1])) {
        iconNext.value = IconNextDisable;
        canNext.value = false;
      } else {
        iconNext.value = IconNext;
        canNext.value = true;
      }
    });

    const isShowExposureDetail = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      return exposure && exposure.type !== ExposureType.TRANSITION;
    });

    const handleKeyDown = (e: any) => {
      if (e.key == "ArrowRight" || e.key == "ArrowDown") {
        onClickPrevNextMedia(NEXT_EXPOSURE);
      } else if (e.key == "ArrowLeft" || e.key == "ArrowUp") {
        onClickPrevNextMedia(PREV_EXPOSURE);
      }
    };
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });

    onUnmounted(() => {
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
      exposureTypes,
      currentLesson,
      currentUnit,
      unitText,
      lessonText,
      remainingText,
      itemText,
      pageText,
    };
  },
});
