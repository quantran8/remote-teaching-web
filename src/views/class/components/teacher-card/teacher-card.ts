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
    const { getters, dispatch } = useStore();
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
      () => getters["teacherRoom/isAllVideoHidden"]
    );
    const isAllAudioMuted = computed(
      () => getters["teacherRoom/isAllAudioMuted"]
    );

    const globalAudioText = computed(() =>
      getters["teacherRoom/isAllAudioMuted"] ? "Unmute All" : "Mute All"
    );
    const globalVideoText = computed(() =>
      getters["teacherRoom/isAllVideoHidden"] ? "Show All" : "Hide All"
    );

    const globalAudioIcon = computed(() =>
      getters["teacherRoom/isAllAudioMuted"]
        ? "icon-audio-on"
        : "icon-audio-off"
    );
    const globalVideoIcon = computed(() =>
      getters["teacherRoom/isAllVideoHidden"]
        ? "icon-video-on"
        : "icon-video-off"
    );

    const toggleAudio = () => {
      dispatch("teacherRoom/setTeacherAudio", {
        id: props.id,
        enable: !props.audioEnabled,
      });
    };

    const toggleVideo = () => {
      dispatch("teacherRoom/setTeacherVideo", {
        id: props.id,
        enable: !props.videoEnabled,
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

    const localAudios = computed(() => getters["teacherRoom/localAudios"]);
    const onDrop = async (event: any) => {
      event.preventDefault();
      const studentId = event.dataTransfer.getData("studentId");
      await dispatch("teacherRoom/addStudentAudio", {
        id: studentId,
      });
      await dispatch("teacherRoom/clearStudentRaisingHand", { id: studentId });
    };
    const onDragOver = (event: any) => {
      event.preventDefault();
    };
    const onClickClearAll = () => {
      dispatch("teacherRoom/clearStudentAudio");
    };
    return {
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
      localAudios,
      onDrop,
      onDragOver,
      onClickClearAll,
    };
  },
});
