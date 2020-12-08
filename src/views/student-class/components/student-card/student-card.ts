import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
export default defineComponent({
  components: { StudentBadge },
  props: {
    id: String,
    index: {
      type: Number,
      required: true,
    },
    name: String,
    badge: {
      type: Number,
      default: 1,
    },
    audioEnabled: {
      type: Boolean,
      default: false,
    },
    videoEnabled: {
      type: Boolean,
      default: false,
    },
    showBadge: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const isContextMenuVisible = ref(false);

    const audioIcon = computed(() =>
      props.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      props.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    watch(props, () => {
      isContextMenuVisible.value = false;
    });

    const toggleContextMenu = () => {
      isContextMenuVisible.value = !isContextMenuVisible.value;
    };
    const hideContextMenu = () => {
      isContextMenuVisible.value = false;
    };

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> =
        store.getters["studentRoom/globalAudios"];
      return props.id && enableAudios.indexOf(props.id) !== -1;
    });

    return {
      audioIcon,
      videoIcon,
      isContextMenuVisible,
      toggleContextMenu,
      hideContextMenu,
      isAudioHightlight,
    };
  },
});
