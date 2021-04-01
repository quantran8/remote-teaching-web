import { LoginInfo, MatIcon, RoleName } from "@/commonui";
import UnityView from "@/components/common/unity-view/UnityView.vue";
import { GLError, GLErrorCode } from "@/models/error.model";
import { ClassView, StudentState } from "@/store/room/interface";
import gsap from "gsap";
import { computed, ComputedRef, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
import { StudentGallery } from "./components/student-gallery";

export default defineComponent({
  components: {
    StudentCard,
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
    const teacher = computed(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);
    const designateTargets = computed(() => store.getters["interactive/targets"]);
    const localTargets = computed(() => store.getters["interactive/localTargets"]);
    const isAssigned = computed(() => store.getters["interactive/isAssigned"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN);
    const isGameView = computed(() => store.getters["studentRoom/classView"] === ClassView.GAME);
    const errors: ComputedRef<GLError> = computed(() => store.getters["studentRoom/error"]);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isStickerMode = computed(() => store.getters["annotation/isStickerMode"]);

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

    const audioIcon = computed(() => (student.value?.audioEnabled ? "icon-audio-on" : "icon-audio-off"));
    const videoIcon = computed(() => (student.value?.videoEnabled ? "icon-video-on" : "icon-video-off"));

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

    const onUnityLoaderLoaded = () => {
      console.info("onUnityLoaderLoaded");
    };
    const onUnityViewLoading = (progress: number) => {
      console.info("onUnityViewLoading", progress);
    };
    const onUnityViewLoaded = () => {
      console.info("onUnityViewLoaded");
    };

    // const animate = (event: MouseEvent) => {
    //   const timeline = gsap.timeline();
    //   galleryRef.value?.childNodes.forEach(node => {
    //     timeline.to(node, { scale: 1, duration: 0.3 });
    //   });
    //   // galleryRef.value?.childNodes
    //   //   gsap.to(, { scale: 0 });
    // };

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
      isGameView,
      onUnityLoaderLoaded,
      onUnityViewLoading,
      onUnityViewLoaded,
      isStickerMode,
    };
  },
});
