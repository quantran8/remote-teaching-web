import { useFakeVideoUrl } from "@/fake/video.fake";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    id: String,
    name: String,
    audioEnabled: {
      type: Boolean,
      default: true,
    },
    videoEnabled: {
      type: Boolean,
      default: true,
    },
  },

  setup(props, { emit }) {
    const video = useFakeVideoUrl(0);
    const store = useStore();
    const contextMenuVisibility = ref(false);
    const toggleContextMenu = () => {
      contextMenuVisibility.value = !contextMenuVisibility.value;
    };
    const audioIcon = computed(() =>
      props.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      props.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    const toggleAudio = () => {
      store.dispatch("class/setTeacherAudio", {
        teacherId: props.id,
        audioEnabled: !props.audioEnabled,
      });
    };

    const toggleVideo = () => {
      store.dispatch("class/setTeacherVideo", {
        teacherId: props.id,
        videoEnabled: !props.videoEnabled,
      });
    };

    const onClickHideAll = () => {
      emit("hide-all");
    };
    const onClickMuteAll = () => {
      emit("mute-all");
    };
    const onClickEnd = () => {
      emit("end");
    };
    return {
      video,
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
      contextMenuVisibility,
      toggleContextMenu,
      onClickHideAll,
      onClickMuteAll,
      onClickEnd,
    };
  },
});
