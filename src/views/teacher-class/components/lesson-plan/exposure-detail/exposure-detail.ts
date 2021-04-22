import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import ExposureItem from "./exposure-item/exposure-item.vue";
export default defineComponent({
  emits: ["click-back", "click-media"],
  props: ["exposure"],
  components: {
    ExposureItem,
  },

  setup(props, { emit }) {
    const { dispatch } = useStore();
    const showInfo = ref(false);

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
      await dispatch("teacherRoom/setClearBrush", {});
    };
    const toggleInformationBox = () => {
      showInfo.value = !showInfo.value;
    };

    return { onClickItem, onClickBack, onClickMedia, toggleInformationBox, showInfo };
  },
});
