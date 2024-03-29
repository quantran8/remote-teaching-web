import IconImage from "@/assets/images/image.png";
import PhotoCamera from "@/assets/images/photo-camera.png";
import IconAudioOff from "@/assets/teacher-class/audio-off-small.svg";
import IconAudioOn from "@/assets/teacher-class/audio-on-small.svg";
import IconExpand from "@/assets/teacher-class/expanded.png";
import IconShrink from "@/assets/teacher-class/minimum.png";
import IconPaletteOff from "@/assets/teacher-class/touch-off-small-blue.svg";
import IconPaletteOn from "@/assets/teacher-class/touch-on-small-blue.svg";
import IconVideoOff from "@/assets/teacher-class/video-off-small.svg";
import IconVideoOn from "@/assets/teacher-class/video-on-small.svg";
import { CaptureNotification } from "@/locales/localeid";
import { StudentState } from "@/store/room/interface";
import { SESSION_MAXIMUM_IMAGE } from "@/utils/constant";
import { defineComponent } from "@vue/runtime-core";
import { notification } from "ant-design-vue";
import { gsap } from "gsap";
import { computed, ComputedRef, inject, ref, watch } from "vue";
import { fmtMsg, MatIcon } from "vue-glcommonui";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    MatIcon,
  },
  props: {
    student: { type: Object as () => StudentState, required: true },
    show: Boolean,
    isLarge: Boolean,
    allowExpend: Boolean,
    isExpended: Boolean,
    focusedStudent: Boolean,
  },
  setup(props, { emit }) {
    const store = useStore();
    const audioIcon = computed(() => (props.student.audioEnabled ? IconAudioOn : IconAudioOff));
    const videoIcon = computed(() => (props.student.videoEnabled ? IconVideoOn : IconVideoOff));
    const paletteIcon = computed(() => (props.student.isPalette ? IconPaletteOn : IconPaletteOff));
    const isRasingHand = ref(false);
    const isShowExpandIcon = computed(() => store.getters["teacherRoom/getStudentModeOneId"] !== props.student.id);
    const students: ComputedRef<Array<StudentState>> = computed(() => store.getters["teacherRoom/students"]);
    const currentSchoolId = computed(() => store.getters["teacher/currentSchoolId"]);
    const isOnePalette = ref(false);
    const enableVideoText = computed(() => fmtMsg(CaptureNotification.EnableStudentVideo, { studentName: props.student.englishName }));
    const reachedMaximumText = computed(() => fmtMsg(CaptureNotification.ReachedMaximum, { studentName: props.student.englishName }));
    const checkStudentPalette = () => {
      if (students.value.every((s) => !s.isPalette)) {
        isOnePalette.value = true;
      } else {
        isOnePalette.value = props.student.isPalette;
      }
    };
    watch(props, () => {
      isRasingHand.value = props.student.raisingHand;
      checkStudentPalette();
    });
    const onClickClearRaisingHand = async () => {
      await store.dispatch("teacherRoom/clearStudentRaisingHand", {
        id: props.student.id,
      });
    };
    const toggleAudio = async () => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: props.student.id,
        enable: !props.student.audioEnabled,
      });
    };

    const toggleVideo = async () => {
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: props.student.id,
        enable: !props.student.videoEnabled,
      });
    };
    const toggleAnnotation = async () => {
      if (isOnePalette.value) {
        if (!props.student.isPalette === true) {
          await store.dispatch("teacherRoom/disableAllStudentsPalette");
        }
        await store.dispatch("teacherRoom/toggleAnnotation", {
          studentId: props.student.id,
          isEnable: !props.student.isPalette,
        });
      }
    };
    const addABadge = async () => {
      await store.dispatch("teacherRoom/setStudentBadge", {
        id: props.student.id, // studentId
        badge: 1, // increase by 1
      });
    };
    const actionEnter = (element: HTMLElement) => {
      gsap.from(element.children[0], { translateY: -20, opacity: 0, clearProps: "all", ease: "Power2.easeInOut", duration: 0.2 });
    };
    const toolEnter = (element: HTMLElement) => {
      gsap.from(element.children[0], { translateX: 0, translateY: 0, opacity: 0, clearProps: "all", ease: "Power2.easeInOut" });
    };
    const arrowIcon = computed(() => (props.focusedStudent ? IconShrink : IconExpand));
    const updateFocusStudent: any = inject("updateFocusStudent");
    const handleExpand = () => {
      if (props.focusedStudent) {
        return updateFocusStudent();
      }
      updateFocusStudent(props.student.id);
    };

    const captureImage = async () => {
      if (!props.student.videoEnabled) {
        notification.info({
          message: enableVideoText.value,
          duration: 3,
        });
        return;
      }
      if (props.student.imageCapturedCount >= SESSION_MAXIMUM_IMAGE) {
        notification.info({
          message: reachedMaximumText.value,
          duration: 3,
        });
        return;
      }
      await store.dispatch("teacherRoom/sendRequestCaptureImage", { isCaptureAll: false, studentId: props.student.id });
    };

    return {
      isRasingHand,
      audioIcon,
      videoIcon,
      paletteIcon,
      onClickClearRaisingHand,
      toggleAudio,
      toggleVideo,
      toggleAnnotation,
      addABadge,
      actionEnter,
      toolEnter,
      arrowIcon,
      handleExpand,
      isShowExpandIcon,
      isOnePalette,
      captureImage,
      IconImage,
      PhotoCamera,
      currentSchoolId,
    };
  },
});
