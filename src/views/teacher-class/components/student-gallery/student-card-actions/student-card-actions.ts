import { defineComponent } from "@vue/runtime-core";
import { computed, ref, watch, inject, ComputedRef } from "vue";
import IconVideoOff from "@/assets/teacher-class/video-off-small.svg";
import IconVideoOn from "@/assets/teacher-class/video-on-small.svg";
import IconAudioOn from "@/assets/teacher-class/audio-on-small.svg";
import IconAudioOff from "@/assets/teacher-class/audio-off-small.svg";
import IconPaletteOn from "@/assets/teacher-class/touch-on-small.svg";
import IconPaletteOff from "@/assets/teacher-class/touch-off-small.svg";
import IconExpand from "@/assets/teacher-class/expanded.png";
import IconShrink from "@/assets/teacher-class/minimum.png";
import { useStore } from "vuex";
import { StudentState } from "@/store/room/interface";
import { gsap } from "gsap";

export default defineComponent({
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
    const isOnePalette = ref(false);
    const checkStudentPalette = () => {
      if (students.value.every(s => !s.isPalette)) {
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
    };
  },
});
