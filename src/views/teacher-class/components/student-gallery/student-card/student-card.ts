import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
import { StudentCardActions } from "../student-card-actions";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import gsap from "gsap";

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
    allowExpend: Boolean,
  },
  setup(props) {
    const store = useStore();
    const isNotJoinned = computed(() => props.student.status !== InClassStatus.JOINED);
    const interactive = computed(() => store.getters["interactive/interactiveStatus"](props.student.id));
    const isMouseEntered = ref<boolean>(false);
    const studentOneAndOneId = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);
    const isStudentOne = ref(props.student.id == studentOneAndOneId.value);
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const isLowBandWidth = computed(() => {
      const listStudentLowBandWidth = store.getters["teacherRoom/listStudentLowBandWidth"];
      return listStudentLowBandWidth.findIndex((id: string) => id === props.student.id) > -1;
    });
    const isExpended = ref<boolean>(false);
    const containerRef = ref<HTMLDivElement>();

    watch(studentOneAndOneId, () => {
      isStudentOne.value = props.student.id == studentOneAndOneId.value;
    });

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> = store.getters["teacherRoom/enableAudios"];
      return props.student.id && enableAudios.indexOf(props.student.id) !== -1;
    });

    const showCorrectAnswer = computed(() => {
      return interactive.value.status !== 0 && interactive.value.multiAssign && !isNotJoinned.value;
    });

    const onOneAndOne = async () => {
      if (props.setModeOne && !isNotJoinned.value) {
        await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value.id });
        await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
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

    const expendToggleHandler = () => {
      const containerBoundingClientRect = containerRef.value?.getBoundingClientRect();
      if (!containerBoundingClientRect) {
        return;
      }

      const onComplete = () => {
        isExpended.value = !isExpended.value;
      };

      const { width, height, left, top } = containerBoundingClientRect;
      const scalePer = 40;
      const newWidth = width + (width * scalePer) / 100;
      const newHeight = height + (height * scalePer) / 100;

      const x = window.innerWidth - left - newWidth > 20 ? "left" : "right";
      const y = window.innerHeight - top - newHeight > 20 ? "top" : "bottom";

      if (!isExpended.value) {
        gsap.to(containerRef.value!, { position: "absolute", zIndex: 9, width: newWidth, [x]: 0, [y]: 0, onComplete });
      } else {
        gsap.to(containerRef.value!, { width: "100%", zIndex: 0, [x]: 0, [y]: 0, clearProps: true, onComplete });
      }
    };

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
      studentOneAndOneId,
      isStudentOne,
      IconLowWifi,
      isLowBandWidth,
      isExpended,
      expendToggleHandler,
      containerRef,
    };
  },
});
