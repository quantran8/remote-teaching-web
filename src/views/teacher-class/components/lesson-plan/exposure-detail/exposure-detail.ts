import { defineComponent, onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import ExposureItem from "./exposure-item/exposure-item.vue";
import { exposureTypes } from "../lesson-plan";
export default defineComponent({
  emits: ["click-back", "click-media"],
  props: ["exposure", "type"],
  components: {
    ExposureItem,
  },

  setup(props, { emit }) {
    const { dispatch } = useStore();
    const showInfo = ref(false);
    const listMedia = ref([]);
    const exposureTitle = ref("");

    onMounted(() => {
      let resultList = props.exposure.items;
      switch (props.type) {
        case exposureTypes.VCP_BLOCK:
          exposureTitle.value = `${props.exposure.name} ( ${props.exposure.duration})`;
          break;
        case exposureTypes.TEACHING_ACTIVITY_BLOCK:
          resultList = props.exposure.teachingActivityBlockItems;
          exposureTitle.value = "Teaching Activity";
          break;
        case exposureTypes.CONTENT_BLOCK:
          resultList = props.exposure.contentBlockItems;
          exposureTitle.value = "Content";
          break;
        default:
          break;
      }
      listMedia.value = resultList
        .map((item: any) => {
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
    const isTeachingActivityBlock = computed(() => props.type === exposureTypes.TEACHING_ACTIVITY_BLOCK);
	
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
    };
  },
});
