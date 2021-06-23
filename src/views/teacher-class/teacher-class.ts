import { ErrorCode, LoginInfo, RoleName } from "@/commonui";
import { GLErrorCode } from "@/models/error.model";
import { ClassView, TeacherState } from "@/store/room/interface";
import { Paths } from "@/utils/paths";
import { Modal } from "ant-design-vue";
import { gsap } from "gsap";
import { computed, ComputedRef, defineComponent, onBeforeMount, onUnmounted, ref, watch, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const fpPromise = FingerprintJS.load();
import {
  TeacherCard,
  LessonPlan,
  ActivityContent,
  StudentGallery,
  GlobalAudioBar,
  ErrorModal,
  DesignateTarget,
  TeacherPageHeader,
  WhiteboardPalette,
} from "./components";
export default defineComponent({
  components: {
    TeacherCard,
    LessonPlan,
    ActivityContent,
    GlobalAudioBar,
    StudentGallery,
    ErrorModal,
    DesignateTarget,
    TeacherPageHeader,
    WhiteboardPalette,
  },
  async beforeUnmount() {
    const store = useStore();
    await store.dispatch("teacherRoom/leaveRoom");
  },
  async created() {
    const { getters, dispatch } = useStore();
    const route = useRoute();
    const router = useRouter();
    const { classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/loginInfo"];
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    try {
      await dispatch("teacherRoom/initClassRoom", {
        classId: classId,
        userId: loginInfo.profile.sub,
        userName: loginInfo.profile.name,
        role: RoleName.teacher,
        browserFingerPrinting: visitorId,
      });
    } catch (err) {
      if (err.code === ErrorCode.ConcurrentUserException) {
        await router.push("/teacher");
      }
    }
    await dispatch("teacherRoom/joinRoom");
  },

  setup() {
    const { getters, dispatch } = useStore();
    const router = useRouter();
    const hasConfirmed = ref(false);

    const isDesignatingTarget = computed(() => getters["interactive/isDesignatingTarget"]);
    const modalDesignateTarget = computed(() => getters["interactive/modalDesignateTarget"]);
    const allowDesignate = computed(() => getters["interactive/targets"].length === 0);
    const teacher: ComputedRef<TeacherState> = computed(() => getters["teacherRoom/teacher"]);
    const error = computed(() => getters["teacherRoom/error"]);
    const isClassNotActive = computed(() => {
      return error.value && error.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE;
    });
    const isLessonPlan = computed(() => getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const currentExposureItemMedia = computed(() => getters["lesson/currentExposureItemMedia"]);
    const roomInfo = computed(() => {
      return getters["teacherRoom/info"];
    });
    const currentView = computed(() => {
      return getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return getters["teacherRoom/isGalleryView"];
    });

    const isBlackOutContent = computed(() => getters["lesson/isBlackOut"]);

    const isSidebarCollapsed = ref<boolean>(true);
    watch(isGalleryView, value => {
      isSidebarCollapsed.value = value;
    });

    // const isGameView = computed(() => {
    //   return getters["teacherRoom/isGameView"];
    // });
    // console.log(isGameView.value, 'game view');

    const setClassView = async (newView: ClassView) => {
      await dispatch("teacherRoom/setClassView", { classView: newView });
    };

    const toggleView = async () => {
      if (isGalleryView.value) {
        isSidebarCollapsed.value = false;
        await setClassView(ClassView.LESSON_PLAN);
      } else {
        isSidebarCollapsed.value = true;
        await setClassView(ClassView.GALLERY);
      }
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    const onClickHideAll = async () => {
      await dispatch("teacherRoom/hideAllStudents");
    };

    const onClickShowAll = async () => {
      await dispatch("teacherRoom/showAllStudents");
    };

    const onClickMuteAll = async () => {
      await dispatch("teacherRoom/muteAllStudents");
    };

    const onClickUnmuteAll = async () => {
      await dispatch("teacherRoom/unmuteAllStudents");
    };

    const onClickLeave = async () => {
      hasConfirmed.value = true;
      await router.push("/teacher");
    };

    const onClickEnd = async () => {
      Modal.confirm({
        title: "This will end the session and close the remote classroom for all the students. Are you sure you want to continue?",
        okText: "Yes",
        cancelText: "No",
        okButtonProps: { type: "danger" },
        onOk: async () => {
          try {
            await dispatch("teacherRoom/endClass");
            await dispatch("lesson/clearLessonData");
            await router.push("/teacher");
          } catch (err) {
            Modal.destroyAll();
            const message = err.body.message;
            await dispatch("setToast", { message: message });
          }
        },
      });
    };
    const onClickCloseError = () => {
      // store.dispatch("teacherRoom/setError", null);
      // does nothing, we only accept leave room;
    };

    watch(error, async () => {
      if (error.value) {
        await router.push("/teacher");
      }
    });

    const ctaVisible = ref(false);

    const onClickContentView = async (payload: { x: number; y: number; contentId: string }) => {
      await dispatch("teacherRoom/teacherAnswer", payload);
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
    const isConnected = computed(() => getters["teacherRoom/isConnected"]);
    watch(isConnected, async () => {
      if (!isConnected.value) return;
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        await dispatch("teacherRoom/joinWSRoom", { browserFingerPrinting: visitorId });
      } catch (err) {
        if (err.code === ErrorCode.ConcurrentUserException) {
          await dispatch("setToast", { message: err.message });
        }
      }
    });
    return {
      onClickHideAll,
      onClickShowAll,
      onClickMuteAll,
      onClickUnmuteAll,
      currentView,
      isGalleryView,
      setClassView,
      toggleView,
      teacher,
      onClickEnd,
      onClickLeave,
      isClassNotActive,
      onClickCloseError,
      ctaVisible,
      isDesignatingTarget,
      allowDesignate,
      onClickContentView,
      modalDesignateTarget,
      roomInfo,
      isSidebarCollapsed,
      // isGameView,
      // onUnityLoaderLoaded,
      // onUnityViewLoading,
      // onUnityViewLoaded
      isLessonPlan,
      currentExposureItemMedia,
      isBlackOutContent,
    };
  },
});
