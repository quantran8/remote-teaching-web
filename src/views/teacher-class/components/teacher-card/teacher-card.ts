import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";

export default defineComponent({
  props: {
    id: String,
    name: String,
    isGalleryView: Boolean,
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
    const audioIcon = computed(() => (props.audioEnabled ? IconAudioOn : IconAudioOff));
    const videoIcon = computed(() => (props.videoEnabled ? IconVideoOn : IconVideoOff));
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

	const isLowBandWidth = computed(() => getters["teacherRoom/isLowBandWidth"]);

    return {
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
      contextMenuVisibility,
      toggleContextMenu,
      hideContextMenu,
      localAudios,
      onDrop,
      onDragOver,
      onClickClearAll,
	  isLowBandWidth,
	  IconLowWifi
    };
  },
});
