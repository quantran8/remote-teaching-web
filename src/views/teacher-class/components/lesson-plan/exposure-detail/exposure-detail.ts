import { defineComponent, onMounted, ref, computed, watch } from "vue";
import { useStore } from "vuex";
import ExposureItem from "./exposure-item/exposure-item.vue";
import { exposureTypes } from "../lesson-plan";
import { Empty } from "ant-design-vue";
import { getSeconds, secondsToTimeStr } from "@/utils/convertDuration";
import { ExposureType } from "@/store/lesson/state";

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
    const thumbnailURLDefault = ref("");
    const hasZeroTeachingContent = ref(true);
    onMounted(() => {
      let resultList = props.exposure.items;
      if (props.exposure?.teachingActivityBlockItems?.findIndex((teachingItem: any) => teachingItem.textContent) > -1) {
        hasZeroTeachingContent.value = false;
      }
      switch (props.type) {
        case exposureTypes.TRANSITION_BLOCK:
          // hardcode title for ExposureType.TRANSITION
          exposureTitle.value = "Transition";
          break;
        case exposureTypes.VCP_BLOCK:
          exposureTitle.value = `${props.exposure.name} (${secondsToTimeStr(getSeconds(props.exposure.duration))})`;
          break;
        case exposureTypes.TEACHING_ACTIVITY_BLOCK:
          resultList = props.exposure.teachingActivityBlockItems;
          exposureTitle.value = "Teaching Activity";

          break;
        case exposureTypes.CONTENT_BLOCK:
          resultList = props.exposure.contentBlockItems;
          exposureTitle.value = `${props.exposure.name}`;
          thumbnailURLDefault.value = resultList[0]?.media[0]?.image.url;
          break;
        default:
          break;
      }
      listMedia.value = resultList
        .filter((m: any) => m.media[0].image.url)
        .map((item: any) => {
          if (!item.media[0]) return;
          item.media[0].teachingContent = props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK ? item.textContent : "";
          return item.media;
        })
        .flat(1);
    });

    const onClickBack = () => {
      emit("click-back");
    };
    const onClickMedia = (id: string) => {
      emit("click-media", { id: id });
    };
    const onClickItem = async (item: any) => {
      await dispatch("teacherRoom/setCurrentExposureMediaItem", {
        id: item.id,
      });
      await dispatch("teacherRoom/setMode", {
        mode: 1,
      });
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };
    const toggleInformationBox = () => {
      showInfo.value = !showInfo.value;
    };
    const isContentBlock = computed(() => props.type === exposureTypes.CONTENT_BLOCK);
    const isVCPBlock = computed(() => props.type === exposureTypes.VCP_BLOCK);
    const isTransitionBlock = computed(() => props.type === exposureTypes.TRANSITION_BLOCK);
    const isTeachingActivityBlock = computed(() => props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK);
    const thumbnailContentURL = computed(() => props.exposure.thumbnailURL);
    const isShowInfoIcon = computed(() => props.type === exposureTypes.CONTENT_BLOCK || props.exposure.type === ExposureType.TRANSITION);
    const isShowBackButton = computed(() => props.type === exposureTypes.VCP_BLOCK || props.type === exposureTypes.TRANSITION_BLOCK);

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
      exposureTitle,
      thumbnailContentURL,
      thumbnailURLDefault,
      hasZeroTeachingContent,
      isShowBackButton,
      isTransitionBlock,
      isShowInfoIcon,
    };
  },
});
