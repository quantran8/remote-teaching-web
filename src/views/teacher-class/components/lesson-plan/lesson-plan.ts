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
import { fmtMsg } from "vue-glcommonui";

export const exposureTypes = {
  TRANSITION_BLOCK: "TRANSITION_BLOCK",
  LP_COMPLETE_BLOCK: "LP_COMPLETE_BLOCK",
  VCP_BLOCK: "VPC_BLOCK",
  CONTENT_BLOCK: "CONTENT_BLOCK",
  TEACHING_ACTIVITY_BLOCK: "TEACHING_ACTIVITY_BLOCK",
};

export default defineComponent({
  components: { LessonActivity, ExposureDetail },
  emits: ["open-gallery-mode", "toggle-lesson-mode"],
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

    const nextCurrentExposure = computed(() => getters["lesson/nextExposure"]);
    const prevCurrentExposure = computed(() => getters["lesson/previousExposure"]);

    const canNext = computed(() => (nextExposureItemMedia.value || nextCurrentExposure.value ? true : false));
    const canPrev = computed(() => (prevExposureItemMedia.value || prevCurrentExposure ? true : false));
    const iconNext = computed(() => (canNext.value ? IconNext : IconNextDisable));

    const lessonContainer = ref();
    const scrollPosition = ref(0);

    const isOneOneMode = ref("");
    const oneAndOneStatus = computed(() => getters["teacherRoom/getStudentModeOneId"]);
    watch(oneAndOneStatus, (value) => {
      if (value === "" || value === null) {
        isOneOneMode.value = "";
      } else {
        isOneOneMode.value = value;
      }
    });

    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

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
        (item) => item.media[0]?.image?.url,
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
      const scrollLimitPosition = Math.max(
        document.body.scrollHeight,
        lessonContainer.value.scrollHeight,
        document.body.offsetHeight,
        lessonContainer.value.offsetHeight,
        document.body.clientHeight,
        lessonContainer.value.clientHeight,
      );
      scrollPosition.value = lessonContainer.value.scrollTop;
      if (nextPrev === NEXT_EXPOSURE) {
        if (!canNext.value) return;
        if (nextExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: nextExposureItemMedia.value.id,
          });
          scrollPosition.value = scrollPosition.value < scrollLimitPosition ? scrollPosition.value + 50 : scrollLimitPosition;
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(nextCurrentExposure.value);
          scrollPosition.value = 0;
        }
        lessonContainer.value.scrollTo(0, scrollPosition.value);
      } else {
        if (!canPrev.value) return;
        if (prevExposureItemMedia.value !== undefined) {
          await dispatch("teacherRoom/setCurrentExposureMediaItem", {
            id: prevExposureItemMedia?.value?.id,
          });
          scrollPosition.value = scrollPosition.value <= 0 ? 0 : scrollPosition.value - 50;
        } else {
          await dispatch("teacherRoom/endExposure", {
            id: currentExposure?.value?.id,
          });
          onClickExposure(prevCurrentExposure.value);
          scrollPosition.value = 0;
        }
        lessonContainer.value.scrollTo(0, scrollPosition.value);
      }
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    const isShowExposureDetail = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      return exposure !== undefined;
    });

    const isTransitionType = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      return exposure.type === ExposureType.TRANSITION;
    });

    const isCompleteType = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      return exposure.type === ExposureType.COMPLETE;
    });

    const handleKeyDown = async (e: any) => {
      if (e.key == "ArrowRight" || e.key == "ArrowDown") {
        e.preventDefault();
        await onClickPrevNextMedia(NEXT_EXPOSURE);
      } else if (e.key == "ArrowLeft" || e.key == "ArrowUp") {
        e.preventDefault();
        await onClickPrevNextMedia(PREV_EXPOSURE);
      }
    };
    const showHideLesson = ref(false);
    const showHideLessonOneOne = (value: boolean) => {
      showHideLesson.value = !value;
      emit("toggle-lesson-mode", showHideLesson.value);
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
      isTransitionType,
      isCompleteType,
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
      lessonContainer,
      isOneOneMode,
      showHideLessonOneOne,
      showHideLesson,
    };
  },
});
