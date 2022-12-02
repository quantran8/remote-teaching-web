import noAvatar from "@/assets/images/user-default-gray.png";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { useElementBounding } from "@vueuse/core";
import "animate.css";
import { computed, defineComponent, ref } from "vue";
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
    focusStudentId: String,
    scaleOption: Number,
  },
  setup(props) {
    const store = useStore();
    const isNotJoinned = computed(() => props.student.status !== InClassStatus.JOINED);
    const interactive = computed(() => store.getters["interactive/interactiveStatus"](props.student.id));
    const platform = computed(() => store.getters["platform"]);
    const isUsingAgora = true; // computed(() => platform.value === VCPlatform.Agora);

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
        }
        if (currentExposureItemMedia.value) {
          await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
        }
        await store.dispatch("teacherRoom/setStudentOneId", { id: props.student.id });

        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: true,
          id: props.student.id,
        });
        // if (store.getters["platform"] === VCPlatform.Zoom) {
        //   await store.dispatch("teacherRoom/generateOneToOneToken", {
        // 	 classId: store.getters["teacherRoom/info"]?.id
        //   });
        // }
      }
    };

    const avatarStudent = computed(() => (props.student.avatar ? props.student.avatar : noAvatar));

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
    const parentCard = computed(() => studentRef.value?.parentElement);
    const { width, height, top, bottom, left, right } = useElementBounding(studentRef);
    const { width: parentWidth, top: parentTop, bottom: parentBottom, left: parentLeft, right: parentRight } = useElementBounding(parentCard);

    const maxScaleRatio = computed(() => {
      return width.value ? parentWidth.value / width.value : 1;
    });
    const actualScaleRatio = computed(() => {
      return Math.min(props.scaleOption || 1, maxScaleRatio.value);
    });
    const wrapperWidth = computed(() => {
      // if in one-to-one mode, or the card has room to expand, keep the width as is

      if (isOneToOneStudent.value || maxScaleRatio.value >= 1.1) {
        return "100%";
      }
      // otherwise, make the width 80% (so it can expand)
      return focusedStudent.value ? "100%" : "80%";
    });
    const translateX = computed(() => {
      const studentRefXAxis = studentRef.value ? studentRef.value.getBoundingClientRect() : undefined;
      const parentCardXAxis = parentCard.value ? parentCard.value.getBoundingClientRect() : undefined;
      if (studentRefXAxis && parentCardXAxis) {
        const { width, left, right } = studentRefXAxis;
        const { left: parentLeft, right: parentRight } = parentCardXAxis;
        const scaledWidth = width * actualScaleRatio.value;
        const difference = (scaledWidth - width) / 2;
        const translateValue = Math.round(difference / actualScaleRatio.value);
        if (left === parentLeft) {
          return translateValue;
        }
        if (right === parentRight) {
          return -translateValue;
        }
      }
      return 0;
    });
    const translateY = computed(() => {
      const studentRefYAxis = studentRef.value ? studentRef.value.getBoundingClientRect() : undefined;
      const parentCardYAxis = parentCard.value ? parentCard.value.getBoundingClientRect() : undefined;

      if (studentRefYAxis && parentCardYAxis) {
        const { height, top, bottom } = studentRefYAxis;
        const { top: parentTop, bottom: parentBottom } = parentCardYAxis;
        const scaledHeight = height * actualScaleRatio.value;
        const difference = (scaledHeight - height) / 2;
        const translateValue = Math.round(difference / actualScaleRatio.value);
        if (top === parentTop) {
          return translateValue;
        }
        if (bottom === parentBottom) {
          return -translateValue;
        }
      }
      return 0;
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
      isTurnOnCamera,
      isOneToOneStudent,
      avatarStudent,
      oneAndOne,
      isUsingAgora,
      actualScaleRatio,
      maxScaleRatio,
      translateX,
      translateY,
      wrapperWidth,
    };
  },
});
