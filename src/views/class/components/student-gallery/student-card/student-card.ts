import { useFakeVideoUrl } from "@/fake/video.fake";
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
export default defineComponent({
  components: {
    StudentBadge,
  },
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
      default: true,
    },
    videoEnabled: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const video = useFakeVideoUrl(props.index);
    const isContextMenuVisible = ref(false);
    const store = useStore();

    const audioIcon = computed(() =>
      props.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      props.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    watch(props, () => {
      isContextMenuVisible.value = false;
    });

    const toggleAudio = () => {
      store.dispatch("teacherRoom/setStudentAudio", {
        studentId: props.id,
        audioEnabled: !props.audioEnabled,
      });
    };

    const toggleVideo = () => {
      store.dispatch("teacherRoom/setStudentVideo", {
        studentId: props.id,
        videoEnabled: !props.videoEnabled,
      });
    };

    const addABadge = () => {
      store.dispatch("teacherRoom/setStudentBadge", {
        studentId: props.id,
        badge: props.badge + 1,
      });
    };

    const toggleContextMenu = () => {
      isContextMenuVisible.value = !isContextMenuVisible.value;
    };
    const hideContextMenu = () => {
      isContextMenuVisible.value = false;
    };

    return {
      video,
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
      addABadge,
      isContextMenuVisible,
      toggleContextMenu,
      hideContextMenu,
    };
  },
});
