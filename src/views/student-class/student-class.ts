import { LoginInfo, MatIcon, RoleName } from "@/commonui";
import UnityView from "@/components/common/unity-view/UnityView.vue";
import { TeacherModel } from "@/models";
import { GLError, GLErrorCode } from "@/models/error.model";
import { ClassView, StudentState } from "@/store/room/interface";
import gsap from "gsap";
import { computed, ComputedRef, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { StudentGallery } from "./components/student-gallery";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";

export default defineComponent({
  components: {
    UnityView,
    MatIcon,
    StudentGallery,
  },
  async created() {
    const { getters, dispatch } = useStore();
    const route = useRoute();
    const { studentId, classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/loginInfo"];
    await dispatch("studentRoom/initClassRoom", {
      classId: classId,
      userId: loginInfo.profile.sub,
      userName: loginInfo.profile.name,
      studentId: studentId,
      role: RoleName.parent,
    });
    await dispatch("studentRoom/joinRoom");
  },
  async beforeUnmount() {
    const store = useStore();
    await store.dispatch("studentRoom/leaveRoom");
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const student = computed<StudentState>(() => store.getters["studentRoom/student"]);
    const classInfo = computed<StudentState>(() => store.getters["studentRoom/classInfo"]);
    const teacher = computed<TeacherModel>(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);
    const designateTargets = computed(() => store.getters["interactive/targets"]);
    const localTargets = computed(() => store.getters["interactive/localTargets"]);
    const isAssigned = computed(() => store.getters["interactive/isAssigned"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN);
    const errors: ComputedRef<GLError> = computed(() => store.getters["studentRoom/error"]);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isStickerMode = computed(() => store.getters["annotation/isStickerMode"]);

    const contentSectionRef = ref<HTMLDivElement>();
    const videoContainerRef = ref<HTMLDivElement>();

    watch(errors, () => {
      if (errors.value) {
        if (errors.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE) {
          window.confirm(errors.value.message);
          router.replace("/");
        } else if (errors.value.errorCode === GLErrorCode.CLASS_HAS_BEEN_ENDED) {
          window.confirm(errors.value.message);
          router.replace("/");
        }
      }
    });

    // Left section animation
    watch([isLessonPlan], values => {
      if (videoContainerRef.value) {
        const isOtherSectionVisible = values.find(check => check);
        const timeline = gsap.timeline();
        if (isOtherSectionVisible) {
          timeline.to(videoContainerRef.value, { width: 250, height: 160 });
        } else {
          timeline.to(videoContainerRef.value, { width: "100%", height: "100%" });
        }
      }
    });

    const audioIcon = computed(() => (student.value?.audioEnabled ? IconAudioOn : IconAudioOff));
    const videoIcon = computed(() => (student.value?.videoEnabled ? IconVideoOn : IconVideoOff));

    const toggleAudio = async () => {
      await store.dispatch("studentRoom/setStudentAudio", {
        id: student.value.id,
        enable: !student.value.audioEnabled,
      });
    };

    const toggleVideo = async () => {
      await store.dispatch("studentRoom/setStudentVideo", {
        id: student.value.id,
        enable: !student.value.videoEnabled,
      });
    };
    const isBlackOutContent = computed(() => store.getters["lesson/isBlackOut"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const contentImageStyle = computed(() => {
      return currentExposureItemMedia.value
        ? {
            "background-image": `url("${currentExposureItemMedia.value.image.url}")`,
          }
        : {};
    });

    const onClickRaisingHand = async () => {
      await store.dispatch("studentRoom/studentRaisingHand", {});
    };
    const onClickLike = async () => {
      await store.dispatch("studentRoom/studentLike", {});
    };
    const classAction = computed(() => store.getters["studentRoom/classAction"]);
    const isConnected = computed(() => store.getters["studentRoom/isConnected"]);
    watch(isConnected, async () => {
      if (!isConnected.value) return;
      await store.dispatch("studentRoom/joinWSRoom");
    });

    const onClickContentView = async (payload: { x: number; y: number; contentId: string }) => {
      await store.dispatch("studentRoom/studentAnswer", payload);
    };

    // const onUnityLoaderLoaded = () => {
    //   console.info("onUnityLoaderLoaded");
    // };
    // const onUnityViewLoading = (progress: number) => {
    //   console.info("onUnityViewLoading", progress);
    // };
    // const onUnityViewLoaded = () => {
    //   console.info("onUnityViewLoaded");
    // };

    const studentOneAndOneId = computed(() => store.getters["modeOne/getStudentModeOneId"]);
    const isOneToOne = ref(false);
    const studentIsOneToOne = ref(true);
    watch(studentOneAndOneId, () => {
      if (studentOneAndOneId.value) {
        isOneToOne.value = true;
      } else {
        isOneToOne.value = false;
      }
      if (student.value) {
        studentIsOneToOne.value = student.value.id == studentOneAndOneId.value;
      } else {
        studentIsOneToOne.value = true;
      }
    });

    return {
      student,
      students,
      teacher,
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
      isLessonPlan,
      isBlackOutContent,
      contentImageStyle,
      onClickRaisingHand,
      onClickLike,
      classAction,
      currentExposureItemMedia,
      designateTargets,
      onClickContentView,
      isAssigned,
      localTargets,
      isPointerMode,
      isDrawMode,
      isStickerMode,
      studentOneAndOneId,
      studentIsOneToOne,
      isOneToOne,
      videoContainerRef,
      contentSectionRef,
      classInfo,
    };
  },
});
