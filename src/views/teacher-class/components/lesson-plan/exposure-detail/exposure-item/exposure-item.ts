import {computed, defineComponent, ref} from "vue";
import { useStore } from "vuex";
import { Tooltip, Empty } from "ant-design-vue";

export default defineComponent({
  emits: ["on-click-item"],
  props: {
    items: Array,
    isContentBlock: Boolean,
    isTeachingBlock: Boolean,
  },
  components: {
    Tooltip,
    Empty,
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
    const isContent = computed(() => props.isContentBlock);
    const isTeaching = computed(() => props.isTeachingBlock);
    const hasZeroImage = computed(() => !props.items?.length);
    return {
      onClickItem,
      currentExposureItemMedia,
      isContent,
      isTeaching,
      hasZeroImage,
    };
  },
});
