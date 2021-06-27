import { defineComponent, onMounted, ref } from "vue";
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

    onMounted(() => {
      let resultList = props.exposure.items;
      switch (props.type) {
        case exposureTypes.VCP_BLOCK:
          break;
        case exposureTypes.TEACHING_ACTIVITY_BLOCK:
          resultList = props.exposure.teachingActivityBlockItems;
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

    return { onClickItem, onClickBack, onClickMedia, toggleInformationBox, showInfo, listMedia };
  },
});
