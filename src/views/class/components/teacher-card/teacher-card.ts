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
  emits: ["show-all", "hide-all", "mute-all", "unmute-all", "end"],
  setup(props, { emit }) {
    const video = useFakeVideoUrl(0);
    const store = useStore();
    const contextMenuVisibility = ref(false);
    const toggleContextMenu = () => {
      contextMenuVisibility.value = !contextMenuVisibility.value;
    };
    const hideContextMenu = () => {
      contextMenuVisibility.value = false;
    };
    const audioIcon = computed(() =>
      props.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      props.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    const isAllVideoHidden = computed(
      () => store.getters["class/isAllVideoHidden"]
    );
    const isAllAudioMuted = computed(
      () => store.getters["class/isAllAudioMuted"]
    );

    const globalAudioText = computed(() =>
      store.getters["class/isAllAudioMuted"] ? "Unmute All" : "Mute All"
    );
    const globalVideoText = computed(() =>
      store.getters["class/isAllVideoHidden"] ? "Show All" : "Hide All"
    );

    const globalAudioIcon = computed(() =>
      store.getters["class/isAllAudioMuted"]
        ? "icon-audio-on"
        : "icon-audio-off"
    );
    const globalVideoIcon = computed(() =>
      store.getters["class/isAllVideoHidden"]
        ? "icon-video-on"
        : "icon-video-off"
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

    const onClickToggleVideo = () => {
      emit(isAllVideoHidden.value ? "show-all" : "hide-all");
    };
    const onClickToggleAudio = () => {
      emit(isAllAudioMuted.value ? "unmute-all" : "mute-all");
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
      hideContextMenu,
      onClickToggleVideo,
      onClickToggleAudio,
      onClickEnd,
      globalAudioText,
      globalVideoText,
      globalAudioIcon,
      globalVideoIcon,
    };
  },
});
