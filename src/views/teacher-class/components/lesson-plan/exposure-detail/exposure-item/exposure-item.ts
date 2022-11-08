import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { Tooltip, Empty } from "ant-design-vue";
import IconAudio from "@/assets/teacher-class/sound.png"
import IconVideo from "@/assets/teacher-class/video.png"
import IconPdf from "@/assets/teacher-class/pdf.png"

export default defineComponent({
  emits: ["on-click-item"],
  props: {
    items: Array,
    isContentBlock: Boolean,
    isTeachingBlock: Boolean,
	isAlternateMediaBlock: Boolean,
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
	const isAlternateMedia = computed(() => props.isAlternateMediaBlock)
    const hasZeroImage = computed(() => !props.items?.length);
    return {
      onClickItem,
      currentExposureItemMedia,
      isContent,
      isTeaching,
	  isAlternateMedia,
      hasZeroImage,
	  IconAudio,
      IconVideo,
      IconPdf,
    };
  },
});
