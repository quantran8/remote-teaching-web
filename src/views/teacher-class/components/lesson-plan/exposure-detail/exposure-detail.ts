import { defineComponent, onMounted, ref, computed, watch } from "vue";
import { useStore } from "vuex";
import ExposureItem from "./exposure-item/exposure-item.vue";
import { exposureTypes } from "../lesson-plan";
import { Empty } from "ant-design-vue";
import { Exposure } from "@/store/lesson/state";
import { fmtMsg } from "vue-glcommonui";
import { TeacherClassLessonPlan } from "@/locales/localeid";

export default defineComponent({
  emits: ["click-back", "click-media"],
  props: ["exposure", "type"],
  components: {
    ExposureItem,
    Empty,
  },
  setup(props, { emit }) {
    const { dispatch } = useStore();
    const showInfo = ref(false);
    const listMedia = ref([]);
    const exposureTitle = ref("");
    // const thumbnailURLDefault = ref("");
    const hasZeroTeachingContent = ref(true);
    const transitionText = computed(() => fmtMsg(TeacherClassLessonPlan.Transition));
    const lessonCompleteText = computed(() => fmtMsg(TeacherClassLessonPlan.LessonComplete));
    // const teachingActivityText = computed(() => fmtMsg(TeacherClassLessonPlan.TeachingActivity));
    const relatedSlidesText = computed(() => fmtMsg(TeacherClassLessonPlan.RelatedSlides));
    const componentSlidesText = computed(() => fmtMsg(TeacherClassLessonPlan.ComponentSlides));
    const activitySlidesText = computed(() => fmtMsg(TeacherClassLessonPlan.ActivitySlides));
	const alternateMediaText = computed(() => fmtMsg(TeacherClassLessonPlan.AlternateMedia));

    const timeoutClickItem = 300; // 300ms
    const postClickTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

    watch(props, () => {
      configLessonPlan(props.exposure);
    });

    onMounted(() => {
      configLessonPlan(props.exposure);
    });

    const configLessonPlan = (exposure?: Exposure) => {
      if (!exposure) return;
      let resultList: any = exposure.items;
      if (exposure?.teachingActivityBlockItems?.findIndex((teachingItem: any) => teachingItem.textContent) > -1) {
        hasZeroTeachingContent.value = false;
      }
      switch (props.type) {
        case exposureTypes.TRANSITION_BLOCK:
          // hardcode title for ExposureType.TRANSITION
          exposureTitle.value = transitionText.value;
          break;
        case exposureTypes.LP_COMPLETE_BLOCK:
          // hardcode title for ExposureType.COMPLETE
          exposureTitle.value = lessonCompleteText.value;
          break;
        case exposureTypes.VCP_BLOCK:
          exposureTitle.value = relatedSlidesText.value;
          break;
        case exposureTypes.TEACHING_ACTIVITY_BLOCK:
          resultList = exposure.teachingActivityBlockItems;
          exposureTitle.value = activitySlidesText.value;
          break;
        case exposureTypes.CONTENT_BLOCK:
          resultList = exposure.contentBlockItems;
          exposureTitle.value = componentSlidesText.value;
          // thumbnailURLDefault.value = resultList[0]?.media[0]?.image.url;
          break;
		case exposureTypes.ALTERNATE_MEDIA_BLOCK:
		  resultList = exposure.alternateMediaBlockItems;
		  exposureTitle.value = alternateMediaText.value;
		  break;
        default:
          break;
      }
      if (exposureTitle.value !== alternateMediaText.value){
		listMedia.value = resultList
        ?.filter((m: any) => m.media[0]?.image?.url)
        ?.map((item: any) => {
          if (!item.media[0]) return;
          item.media[0].teachingContent = props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK ? item.textContent : "";
          item.media[0].teacherUseOnly = item.teacherUseOnly;
          return item.media;
        })
        ?.flat(1);
	  }
	  else {
		listMedia.value = resultList.map((e:any) => {
		  e = e
		  ?.filter((m: any) => m.media[0]?.image?.url)
          ?.map((item: any) => {
            if (!item.media[0]) return;
            item.media[0].teachingContent = props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK ? item.textContent : "";
            item.media[0].teacherUseOnly = item.teacherUseOnly;
			item.media[0].mediaTypeId = item.mediaTypeId;
            return item.media;
          })
          ?.flat(1);
		  return e
		})
	  }
    };

    const onClickBack = () => {
      emit("click-back");
    };
    const onClickMedia = (id: string) => {
      emit("click-media", { id: id });
    };
    const onClickItem = async (item: any) => {
      // add debounce mechanism for prevent click rapidly
      if (postClickTimer.value !== undefined) {
        clearTimeout(postClickTimer.value);
      }

      postClickTimer.value = setTimeout(async () => {
        await dispatch("teacherRoom/setCurrentExposureMediaItem", {
          id: item.id,
        });
		await dispatch("lesson/setClickedExposureItem", {
		  id: item.id,
		});
        await dispatch("teacherRoom/setClearBrush", {});
        await dispatch("teacherRoom/setResetZoom", {});

        await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
        await dispatch("lesson/setTargetsVisibleListJoinedAction", [], { root: true });
        await dispatch("lesson/setTargetsVisibleAllAction", false, { root: true });
      }, timeoutClickItem);
    };
    const toggleInformationBox = () => {
      showInfo.value = !showInfo.value;
    };
    const isContentBlock = computed(() => props.type === exposureTypes.CONTENT_BLOCK);
    const isVCPBlock = computed(() => props.type === exposureTypes.VCP_BLOCK);
    const isTransitionBlock = computed(() => props.type === exposureTypes.TRANSITION_BLOCK);
    const isLpCompleteBlock = computed(() => props.type === exposureTypes.LP_COMPLETE_BLOCK);
    const isTeachingActivityBlock = computed(() => props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK);
	const isAlternateMediaBlock = computed(()=> props.type === exposureTypes.ALTERNATE_MEDIA_BLOCK);
    // const thumbnailContentURL = computed(() => props.exposure.thumbnailURL);
    // const isShowInfoIcon = computed(() => props.type === exposureTypes.TRANSITION_BLOCK || props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK);
    // const isShowBackButton = computed(() => props.type === exposureTypes.TRANSITION_BLOCK || props.type === exposureTypes.LP_COMPLETE_BLOCK);

    return {
      onClickItem,
      onClickBack,
      onClickMedia,
      toggleInformationBox,
      showInfo,
      listMedia,
      isContentBlock,
      isVCPBlock,
      isTeachingActivityBlock,
      isLpCompleteBlock,
	  isAlternateMediaBlock,
      exposureTitle,
      // thumbnailContentURL,
      // thumbnailURLDefault,
      hasZeroTeachingContent,
      // isShowBackButton,
      isTransitionBlock,
      // isShowInfoIcon,
    };
  },
});
