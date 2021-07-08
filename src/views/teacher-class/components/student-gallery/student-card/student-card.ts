import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, ref, watch, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
import { StudentCardActions } from "../student-card-actions";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import { debounce } from "lodash";

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
    focusStudentId: String,
    scaleOption: Number
  },
  setup(props) {
    const store = useStore();
    const isNotJoinned = computed(() => props.student.status !== InClassStatus.JOINED);
    const interactive = computed(() => store.getters["interactive/interactiveStatus"](props.student.id));
    const isMouseEntered = ref<boolean>(false);
    const isShow = computed(() => {
      return !store.getters["teacherRoom/getStudentModeOneId"] || store.getters["teacherRoom/getStudentModeOneId"] === props.student.id;
    });
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const isLowBandWidth = computed(() => {
      const listStudentLowBandWidth = store.getters["teacherRoom/listStudentLowBandWidth"];
      return listStudentLowBandWidth.findIndex((id: string) => id === props.student.id) > -1;
    });

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> = store.getters["teacherRoom/enableAudios"];
      return props.student.id && enableAudios.indexOf(props.student.id) !== -1;
    });

    const showCorrectAnswer = computed(() => {
      return interactive.value.status !== 0 && interactive.value.multiAssign && !isNotJoinned.value;
    });
    const oneAndOne = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);
    const onOneAndOne = async () => {
      if (props.setModeOne && !isNotJoinned.value && props.student?.id !== oneAndOne.value) {
        if (currentExposure.value?.id) {
          await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value.id });
          await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
        }
        await store.dispatch("teacherRoom/setStudentOneId", { id: props.student.id });
        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: true,
          id: props.student.id,
        });
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

    const studentRef = ref<any>(null);
    const currentPosition = ref<any>(null);
    const handleResize = debounce(() => {
      if (!studentRef.value) return;
      let right = 0;
      const { width } = studentRef.value.getBoundingClientRect();
      if (width + 10 <= studentRef.value.offsetLeft) {
        right = width - 50;
      }
      if (width > studentRef.value.offsetParent.offsetWidth / 2) {
        right = width + 150;
      }
      currentPosition.value = {
        x: studentRef.value.offsetLeft,
        y: studentRef.value.offsetTop,
        right: right,
      };
    }, 100);
    onMounted(() => {
      handleResize();
      window.addEventListener("resize", handleResize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    const focusedStudent = computed(() => props.focusStudentId === props.student.id);

    const isTurnOnCamera = computed(() => {
      return props.student.videoEnabled;
    });

    const isOneToOneStudent = computed(() => {
      return store.getters["teacherRoom/getStudentModeOneId"] === props.student.id;
    });

    return {
      isNotJoinned,
      onDragStart,
      isAudioHightlight,
      onOneAndOne,
      interactive,
      showCorrectAnswer,
      onMouseChange,
      isMouseEntered,
      isSpeaking,
      isShow,
      IconLowWifi,
      isLowBandWidth,
      focusedStudent,
      studentRef,
      currentPosition,
      isTurnOnCamera,
	  isOneToOneStudent
    };
  },
});
