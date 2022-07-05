import { TeacherRoomManager } from '@/manager/room/teacher.manager';
import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, defineComponent, ref, watch, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import StudentBadge from "../student-badge/student-badge.vue";
import { StudentCardActions } from "../student-card-actions";
import IconLowWifi from "@/assets/teacher-class/slow-wifi.svg";
import { debounce } from "lodash";
import noAvatar from "@/assets/images/user-default-gray.png";
import "animate.css";
import { VCPlatform } from "@/store/app/state";
import {useElementBounding} from "@vueuse/core";

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
    const isUsingAgora = computed(() => platform.value === VCPlatform.Agora);

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
        if (store.getters["platform"] === VCPlatform.Zoom) {
		  await store.dispatch("teacherRoom/generateOneToOneToken", {
			 classId: store.getters["teacherRoom/info"]?.id
		  });
        }
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
    const { width, height, top, bottom, left, right } =
        useElementBounding(studentRef);
    const {
      width: parentWidth,
      top: parentTop,
      bottom: parentBottom,
      left: parentLeft,
      right: parentRight,
    } = useElementBounding(parentCard);

    const maxScaleRatio = computed(() =>
        width.value ? parentWidth.value / width.value : 1
    );
    const actualScaleRatio = computed(() =>
        focusedStudent.value ? Math.min(props.scaleOption || 1, maxScaleRatio.value) : 1
    );
    const translateX = computed(() => {
      const scaledWidth = width.value * actualScaleRatio.value;
      const difference = (scaledWidth - width.value) / 2;
      const translateValue = Math.round(difference / actualScaleRatio.value);
      if (left.value === parentLeft.value) {
        return translateValue;
      }
      if (right.value === parentRight.value) {
        return -translateValue;
      }
      return 0;
    });
    const translateY = computed(() => {
      const scaledHeight = height.value * actualScaleRatio.value;
      const difference = (scaledHeight - height.value) / 2;
      const translateValue = Math.round(difference / actualScaleRatio.value);
      if (top.value === parentTop.value) {
        return translateValue;
      }
      if (bottom.value === parentBottom.value) {
        return -translateValue;
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
      translateX,
      translateY,
    };
  },
});
