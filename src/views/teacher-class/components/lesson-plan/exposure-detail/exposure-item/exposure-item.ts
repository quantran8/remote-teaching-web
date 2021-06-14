import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["on-click-item"],
  props: {
    items: Array,
  },
  setup(props, { emit }) {
    const store = useStore();
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);

    const onClickItem = (item: {
      id: string;
      image: {
        url: string;
      };
      selected?: boolean;
    }) => {
      emit("on-click-item", item);
    };
    return {
      onClickItem,
      currentExposureItemMedia,
    };
  },
});
