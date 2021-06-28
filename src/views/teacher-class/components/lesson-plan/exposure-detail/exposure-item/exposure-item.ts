import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { Tooltip } from "ant-design-vue";

export default defineComponent({
  emits: ["on-click-item"],
  props: {
    items: Array,
    isContentBlock: Boolean,
	isTeachingBlock: Boolean
  },
  components: {
    Tooltip,
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
    return {
      onClickItem,
      currentExposureItemMedia,
      isContent,
	  isTeaching
    };
  },
});
