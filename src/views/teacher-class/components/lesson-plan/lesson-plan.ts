import IconPrev from "@/assets/images/arrow-back.png";
import IconPrevDisable from "@/assets/images/arrow-disable-back.png";
import IconNextDisable from "@/assets/images/arrow-disable-forward.png";
import IconNext from "@/assets/images/arrow-forward.png";
import { PinningModal } from "@/components/common";
import { PINNING_MODAL_CONTAINER } from "@/components/common/pinning-modal/pinning-modal";
import { TeacherClassLessonPlan } from "@/locales/localeid";
import { Exposure, ExposureType } from "@/store/lesson/state";
import { ClassView } from "@/store/room/interface";
import { NEXT_EXPOSURE, PREV_EXPOSURE } from "@/utils/constant";
import { getSeconds, secondsToTimeStr } from "@/utils/convertDuration";
import { CloseOutlined, PushpinOutlined } from "@ant-design/icons-vue";
import { useElementSize } from "@vueuse/core";
import { Badge, Empty } from "ant-design-vue";
import { debounce } from "lodash";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useStore } from "vuex";
import ExposureDetail from "./exposure-detail/exposure-detail.vue";
import LessonActivity from "./lesson-activity/lesson-activity.vue";

export const exposureTypes = {
  TRANSITION_BLOCK: "TRANSITION_BLOCK",
  LP_COMPLETE_BLOCK: "LP_COMPLETE_BLOCK",
  VCP_BLOCK: "VPC_BLOCK",
  CONTENT_BLOCK: "CONTENT_BLOCK",
  TEACHING_ACTIVITY_BLOCK: "TEACHING_ACTIVITY_BLOCK",
  ALTERNATE_MEDIA_BLOCK: "ALTERNATE_MEDIA_BLOCK",
};

const INFO_BUTTON_ID = "lp-info";

export enum PopupStatus {
  Pinned = "Pinned",
  Showed = "Showed",
  Hided = "Hided",
}

export default defineComponent({
  components: { LessonActivity, ExposureDetail, Empty, Badge, PushpinOutlined, CloseOutlined },
  emits: ["open-gallery-mode", "toggle-lesson-mode", "open-changing-lesson-unit-modal"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();

    const unitText = computed(() => fmtMsg(TeacherClassLessonPlan.Unit));
    const lessonText = computed(() => fmtMsg(TeacherClassLessonPlan.Lesson));
    const remainingText = computed(() => fmtMsg(TeacherClassLessonPlan.Remaining));
    const itemText = computed(() => fmtMsg(TeacherClassLessonPlan.Item));
    const noDataText = computed(() => fmtMsg(TeacherClassLessonPlan.NoData));
    const pageText = computed(() => fmtMsg(TeacherClassLessonPlan.Page));
    const transitionText = computed(() => fmtMsg(TeacherClassLessonPlan.Transition));
    const lessonCompleteText = computed(() => fmtMsg(TeacherClassLessonPlan.LessonComplete));

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
    const infoPopupStatus = ref<PopupStatus>(PopupStatus.Hided);
    const infoIconRef = ref();
    const canNext = computed(() => (nextExposureItemMedia.value || nextCurrentExposure.value ? true : false));
    const canPrev = computed(() => (prevExposureItemMedia.value || prevCurrentExposure.value ? true : false));
    const iconNext = computed(() => (canNext.value ? IconNext : IconNextDisable));
    const iconPrev = computed(() => (canPrev.value ? IconPrev : IconPrevDisable));
    const exposureTitle = computed(() => {
      const exposure = getters["lesson/currentExposure"];
      if (!exposure) {
        return "";
      }
      switch (exposure.type) {
        case ExposureType.TRANSITION:
          return transitionText.value;
        case ExposureType.COMPLETE:
          return lessonCompleteText.value;
        default:
          return `${exposure.name} (${secondsToTimeStr(getSeconds(exposure.duration))})`;
      }
    });
    const teachingIconPosition = ref({ left: 0, top: 0 });
    const lessonContainer = ref();
    const scrollPosition = ref(0);
    const showInfo = ref(false);
    const isTransitionBlock = computed(() => currentExposure.value?.type === ExposureType.TRANSITION);
    const hasZeroTeachingContent = computed(() => {
      return currentExposure.value?.teachingActivityBlockItems?.findIndex((teachingItem: any) => teachingItem.textContent) <= -1;
    });

    const isOneOneMode = ref("");
    const oneAndOneStatus = computed(() => getters["teacherRoom/getStudentModeOneId"]);
    const unitAndLesson = computed(() => ({ unit: currentUnit.value, lesson: currentLesson.value }));
    watch(oneAndOneStatus, (value) => {
      if (value === "" || value === null) {
        isOneOneMode.value = "";
      } else {
        isOneOneMode.value = value;
      }
      infoPopupStatus.value = PopupStatus.Hided;
    });

    watch(unitAndLesson, async () => {
      if (exposures.value?.length) {
        await onClickExposure(exposures.value[0], true);
      }
    });

    const backToGalleryMode = () => {
      emit("open-gallery-mode");
    };

    const onClickUnit = () => {
      emit("open-changing-lesson-unit-modal");
    };

    const onClickExposure = async (exposure: Exposure | null, force = false) => {
      if (!exposure) return;
      if (!force && exposure.id === currentExposure.value?.id) {
        return;
      }
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
      await dispatch("teacherRoom/setResetZoom", {});

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
      await dispatch("teacherRoom/setResetZoom", {});
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
      await dispatch("teacherRoom/setResetZoom", {});
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

    watch(isShowExposureDetail, (currentVal) => {
      if (!currentVal) {
        infoPopupStatus.value = PopupStatus.Hided;
      }
    });

    const isAlternateMediaType = computed(() => {
      const currentExposure = getters["lesson/currentExposure"];
      const isNotCompleted = currentExposure.contentBlockItems.some((item: any) => {
        return item.isClicked === false;
      });
      //   return !isNotCompleted;
      return false;
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
    const lessonContainerHeaderFixed = ref<HTMLDivElement>();
    const { height: lessonContainerHeaderFixedHeight } = useElementSize(lessonContainerHeaderFixed);

    const hasLongShortcutHeader = computed(() => {
      return currentLesson.value >= 10 || currentUnit.value >= 10;
    });

    const handleMouseMove = debounce((e: any) => {
      if (infoPopupStatus.value === PopupStatus.Pinned) return;
      const editableModalEl = document.querySelector<HTMLElement>(`.${PINNING_MODAL_CONTAINER}`)!;
      const infoButtonEl = document.getElementById(INFO_BUTTON_ID);
      if (!editableModalEl || !infoButtonEl) {
        return (infoPopupStatus.value = PopupStatus.Hided);
      }

      const finalModalHovered = editableModalEl.matches(":hover");
      const noteInfoTriggerHovered = infoButtonEl.matches(":hover");
      if (!noteInfoTriggerHovered && !finalModalHovered) {
        infoPopupStatus.value = PopupStatus.Hided;
      }
    }, 10);
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });

    const handleMouseOver = (event: any) => {
      if (infoPopupStatus.value === PopupStatus.Pinned) return;
      teachingIconPosition.value = {
        left: infoIconRef.value.getBoundingClientRect().left,
        top: infoIconRef.value.getBoundingClientRect().top,
      };
      infoPopupStatus.value = PopupStatus.Showed;
    };

    watch(infoPopupStatus, (currentVal) => {
      if (currentVal === PopupStatus.Showed) {
        window.addEventListener("mousemove", handleMouseMove);
      }
      if (currentVal === PopupStatus.Hided || currentVal === PopupStatus.Pinned) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    });

    const editableModalRef = ref<InstanceType<typeof PinningModal>>();

    const handlePinOrHide = (status: PopupStatus) => {
      infoPopupStatus.value = status;
    };

    const visible = computed(() => infoPopupStatus.value === PopupStatus.Showed);
    return {
      isGalleryView,
      exposures,
      currentExposure,
      currentExposureItemMedia,
      progress,
      remainingTime,
      isShowExposureDetail,
      isTransitionType,
      isAlternateMediaType,
      isCompleteType,
      activityStatistic,
      onClickExposure,
      onClickCloseExposure,
      backToGalleryMode,
      page,
      onClickPrevNextMedia,
      nextExposureItemMedia,
      iconNext,
      iconPrev,
      NEXT_EXPOSURE,
      PREV_EXPOSURE,
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
      exposureTitle,
      showInfo,
      hasZeroTeachingContent,
      isTransitionBlock,
      lessonContainerHeaderFixed,
      lessonContainerHeaderFixedHeight,
      hasLongShortcutHeader,
      onClickUnit,
      editableModalRef,
      infoIconRef,
      teachingIconPosition,
      handleMouseOver,
      visible,
      handlePinOrHide,
      infoPopupStatus,
      PopupStatus,
      noDataText,
    };
  },
});
