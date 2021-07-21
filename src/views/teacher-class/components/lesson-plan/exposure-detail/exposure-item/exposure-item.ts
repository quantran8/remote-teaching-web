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
    const cropImg = ref("");
    const setCropBoxData = () => {
      // if not metadata, return
      // this.$refs.cropper.setCropBoxData(JSON.parse(""));
      // cropImg.value = this.$refs.cropper.getCroppedCanvas().toDataURL();
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
