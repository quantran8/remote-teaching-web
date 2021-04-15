import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
import { StudentCardActions } from "../student-card-actions";

export enum InteractiveStatus {
  DEFAULT = 0,
  ASSIGNED = 1,
  COMPLETED = 2,
}

export default defineComponent({
  components: {
    StudentBadge,
    StudentCardActions,
  },
  props: {
    setModeOne: {
      type: Boolean,
      default: false,
    },
    student: { type: Object as () => StudentState, required: true },
    isLarge: Boolean,
  },
  setup(props) {
    const store = useStore();
    const isNotJoinned = computed(() => props.student.status !== InClassStatus.JOINED);
    const interactive = computed(() => store.getters["interactive/interactiveStatus"](props.student.id));
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const isMouseEntered = ref<boolean>(false);
    const students: ComputedRef<Array<StudentState>> = computed(() => store.getters["teacherRoom/students"]);

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> = store.getters["teacherRoom/enableAudios"];
      return props.student.id && enableAudios.indexOf(props.student.id) !== -1;
    });

    const showCorrectAnswer = computed(() => {
      return interactive.value.status !== 0 && interactive.value.multiAssign && !isNotJoinned.value;
    });

    const setDefault = async (status: boolean) => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: props.student.id,
        enable: status,
      });
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: props.student.id,
        enable: status,
      });
    };

    const onClickClearRaisingHand = async () => {
      await store.dispatch("teacherRoom/clearStudentRaisingHand", {
        id: props.student.id,
      });
    };

    const onOneAndOne = async () => {
      if (props.setModeOne) {
        await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value.id });
        await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
        await store.dispatch("modeOne/setStudentOneId", { id: props.student.id });
        await store.dispatch("updateAudioAndVideoFeed", {});
        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: true,
          id: props.student.id,
        });
        await store.dispatch("updateAudioAndVideoFeed", {});
        await setDefault(false);
        await setDefault(true);
      }
    };

    const onDragStart = (event: any) => {
      event.dataTransfer.setData("studentId", props.student.id);
    };

    const onMouseChange = (entered: boolean) => {
      isMouseEntered.value = entered;
    };

    const isSpeaking = computed(() => {
      const speakingUsers: Array<string> = store.getters["teacherRoom/speakingUsers"];
      return speakingUsers.indexOf(props.student.id) >= 0;
    });

    return {
      isNotJoinned,
      onDragStart,
      isAudioHightlight,
      onClickClearRaisingHand,
      onOneAndOne,
      interactive,
      showCorrectAnswer,
      onMouseChange,
      isMouseEntered,
      isSpeaking,
    };
  },
});
