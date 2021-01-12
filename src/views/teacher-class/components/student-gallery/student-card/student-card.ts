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
    interactive: {
      type: Object,
      default: () => {
        return {
          correct: 0,
          status: InteractiveStatus.DEFAULT,
        };
      },
    },
  },
  setup(props) {
    const isContextMenuVisible = ref(false);
    const store = useStore();
    const isNotJoinned = computed(() => props.status !== InClassStatus.JOINED);
    const audioIcon = computed(() =>
      props.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      props.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> =
        store.getters["teacherRoom/enableAudios"];
      return props.id && enableAudios.indexOf(props.id) !== -1;
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

    const addABadge = async () => {
      await store.dispatch("teacherRoom/setStudentBadge", {
        id: props.id,
        badge: props.badge + 1,
      });
    };
    const onClickClearRaisingHand = async () => {
      await store.dispatch("teacherRoom/clearStudentRaisingHand", {
        id: props.id,
      });
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
    };
  },
});
