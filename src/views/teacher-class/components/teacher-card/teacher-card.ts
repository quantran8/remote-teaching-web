import noAvatar from "@/assets/images/user-default-gray.png";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import { HelperState, TeacherState } from "@/store/room/interface";
import { computed, defineComponent, ref } from "vue";
import { LoginInfo } from "vue-glcommonui";
import { useStore } from "vuex";

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
    const isUsingAgora = true; // computed(() => platform.value === VCPlatform.Agora);

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
    const loginInfo: LoginInfo = getters["auth/getLoginInfo"];
    const userId = loginInfo.profile.sub;
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
    const helperInfo = computed<HelperState>(() => getters["teacherRoom/helperInfo"]);
    const currentUserIsHelper = computed<boolean>(() => helperInfo.value?.id === loginInfo.profile.sub);
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
      userId,
      currentUserIsHelper,
    };
  },
});
