import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["on-click-item"],
  props: {
    title: {
      type: String,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    items: Array,
  },
  setup(props, { emit }) {
    const store = useStore();
    const currentExposureItemMedia = computed(()=> store.getters["lesson/currentExposureItemMedia"]);
    const isToggle = ref(props.collapsed);

    const toggleContent = () => {
      isToggle.value = !isToggle.value;
    };
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
      isToggle,
      toggleContent,
      onClickItem,
      currentExposureItemMedia
    };
  },
});
