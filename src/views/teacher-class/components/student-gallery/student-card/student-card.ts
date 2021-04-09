import { InClassStatus } from "@/store/room/interface";
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";

export enum InteractiveStatus {
  DEFAULT = 0,
  ASSIGNED = 1,
  COMPLETED = 2,
}

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
    status: {
      type: Number,
      default: InClassStatus.DEFAULT,
    },
    raisingHand: {
      type: Boolean,
      default: false,
    },
    setModeOne: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isContextMenuVisible = ref(false);
    const store = useStore();
    const isNotJoinned = computed(() => props.status !== InClassStatus.JOINED);
    const audioIcon = computed(() => (props.audioEnabled ? "icon-audio-on" : "icon-audio-off"));
    const videoIcon = computed(() => (props.videoEnabled ? "icon-video-on" : "icon-video-off"));
    const interactive = computed(() => store.getters["interactive/interactiveStatus"](props.id));
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> = store.getters["teacherRoom/enableAudios"];
      return props.id && enableAudios.indexOf(props.id) !== -1;
    });

    const showCorrectAnswer = computed(() => {
      return interactive.value.status !== 0 && interactive.value.multiAssign && !isNotJoinned.value;
    });

    watch(props, () => {
      isContextMenuVisible.value = false;
    });

    const toggleAudio = async () => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: props.id,
        enable: !props.audioEnabled,
      });
    };

    const toggleVideo = async () => {
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: props.id,
        enable: !props.videoEnabled,
      });
    };

    const setDefault = async (status: boolean) => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: props.id,
        enable: status,
      });
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: props.id,
        enable: status,
      });
    };

    /**
     * Add badge for a student
     */
    const addABadge = async () => {
      await store.dispatch("teacherRoom/setStudentBadge", {
        id: props.id, // studentId
        badge: 1, // increase by 1
      });
    };

    const onClickClearRaisingHand = async () => {
      await store.dispatch("teacherRoom/clearStudentRaisingHand", {
        id: props.id,
      });
    };
    const onOneAndOne = async () => {
      if (props.setModeOne) {
        await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value.id });
        await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
        await store.dispatch("modeOne/setStudentOneId", { id: props.id });
        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: true,
          id: props.id,
        });
        await setDefault(false);
        await setDefault(true);
      }
    };

    const toggleContextMenu = () => {
      isContextMenuVisible.value = !isContextMenuVisible.value;
    };
    const hideContextMenu = () => {
      isContextMenuVisible.value = false;
    };

    const onDragStart = (event: any) => {
      event.dataTransfer.setData("studentId", props.id);
    };
    return {
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
      addABadge,
      isContextMenuVisible,
      toggleContextMenu,
      hideContextMenu,
      isNotJoinned,
      onDragStart,
      isAudioHightlight,
      onClickClearRaisingHand,
      onOneAndOne,
      interactive,
      showCorrectAnswer,
    };
  },
});
