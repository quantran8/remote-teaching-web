import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import { TeacherState } from "@/store/room/interface";
import noAvatar from "@/assets/images/user-default-gray.png";
import { VCPlatform } from "@/store/app/state";

export default defineComponent({
  props: {
    isGalleryView: Boolean,
    teacher: {
      type: Object as () => TeacherState,
    },
  },
  emits: ["show-all", "hide-all", "mute-all", "unmute-all", "end"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const platform = computed(() => getters["platform"]);
    const isUsingAgora = true;// computed(() => platform.value === VCPlatform.Agora);

    const contextMenuVisibility = ref(false);
    const toggleContextMenu = () => {
      contextMenuVisibility.value = !contextMenuVisibility.value;
    };
    const hideContextMenu = () => {
      contextMenuVisibility.value = false;
    };
    const audioIcon = computed(() => (props.teacher?.audioEnabled ? IconAudioOn : IconAudioOff));
    const videoIcon = computed(() => (props.teacher?.videoEnabled ? IconVideoOn : IconVideoOff));
    const toggleAudio = () => {
      dispatch("teacherRoom/setTeacherAudio", {
        id: props.teacher?.id,
        enable: !props.teacher?.audioEnabled,
      });
    };

    const toggleVideo = () => {
      dispatch("teacherRoom/setTeacherVideo", {
        id: props.teacher?.id,
        enable: !props.teacher?.videoEnabled,
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
    const avatarTeacher = computed(() => (props.teacher?.avatar ? props.teacher?.avatar : noAvatar));
    const isSupportedVideo = computed(() => !!(window as any).chrome && !(typeof SharedArrayBuffer === "function"));

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
      IconLowWifi,
      avatarTeacher,
      isUsingAgora,
      isSupportedVideo,
    };
  },
});
