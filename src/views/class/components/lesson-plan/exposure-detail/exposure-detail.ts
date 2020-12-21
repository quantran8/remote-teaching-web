import { computed, defineComponent, ref } from "vue";
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
    const onClickBack = () => {
      emit("click-back");
    };
    const onClickMedia = (id: string) => {
      emit("click-media", { id: id });
    };
    const onClickItem = (item: any) => {
      dispatch("lesson/setCurrentExposureItemMedia", { id: item.id });
    };
    return { onClickItem, onClickBack, onClickMedia };
  },
});
