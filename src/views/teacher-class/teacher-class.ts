import { LoginInfo, RoleName } from "@/commonui";
import { GLErrorCode } from "@/models/error.model";
import { ClassView, TeacherState } from "@/store/room/interface";
import { ClassAction, ClassActionToValue } from "@/store/room/student/state";
import { computed, ComputedRef, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  TeacherCard,
  LessonPlan,
  ActivityContent,
  StudentGallery,
  GlobalAudioBar,
  LeaveModal,
  ErrorModal,
  DesignateTarget,
  TeacherPageHeader,
  StudentControls

} from "./components";
export default defineComponent({
  components: {
    TeacherCard,
    LessonPlan,
    ActivityContent,
    GlobalAudioBar,
    StudentGallery,
    LeaveModal,
    ErrorModal,
    DesignateTarget,
    TeacherPageHeader,
    StudentControls
  },
  async beforeUnmount() {
    const store = useStore();
    await store.dispatch("teacherRoom/leaveRoom");
  },
  async created() {
    const { getters, dispatch } = useStore();
    const route = useRoute();
    const { classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/loginInfo"];
    await dispatch("teacherRoom/initClassRoom", {
      classId: classId,
      userId: loginInfo.profile.sub,
      userName: loginInfo.profile.name,
      role: RoleName.teacher,
    });
    await dispatch("teacherRoom/joinRoom");
  },

  setup() {
    const { getters, dispatch } = useStore();
    const router = useRouter();
    const showModal = ref(false);
    const hasConfirmed = ref(false);
    const isDesignatingTarget = computed(
      () => getters["interactive/isDesignatingTarget"]
    );
    const modalDesignateTarget = computed(() => getters["interactive/modalDesignateTarget"]);
    const allowDesignate = computed(
      () => getters["interactive/targets"].length === 0
    );
    const teacher: ComputedRef<TeacherState> = computed(
      () => getters["teacherRoom/teacher"]
    );
    const error = computed(() => getters["teacherRoom/error"]);
    const isClassNotActive = computed(() => {
      return (
        error.value && error.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE
      );
    });
    const classInfo = computed(()=> {
      return getters["teacherRoom/className"];
    })
    const currentView = computed(() => {
      return getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return getters["teacherRoom/isGalleryView"];
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
        await setClassView(ClassView.LESSON_PLAN);
      } else {
        await setClassView(ClassView.GALLERY);
      }
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

    const onClickEnd = () => {
      showModal.value = true;
    };

    const onClickLeave = async () => {
      hasConfirmed.value = true;
      await dispatch("teacherRoom/endClass");
      router.push("/teacher");
    };
    const onClickCloseError = () => {
      // store.dispatch("teacherRoom/setError", null);
      // does nothing, we only accept leave room;
    };
    const onClickCloseModal = () => {
      showModal.value = false;
    };

    watch(error, () => {
      console.log(error.value);
    });
    const actions = [
      { id: ClassAction.DEFAULT, icon: "none" },
      { id: ClassAction.INTERACTIVE, icon: "interactive" },
      { id: ClassAction.LISTEN, icon: "listen" },
      { id: ClassAction.QUESTION, icon: "question" },
      { id: ClassAction.QUIET, icon: "quiet" },
      { id: ClassAction.SING, icon: "sing" },
      { id: ClassAction.SPEAK, icon: "speak" },
    ];
    const classAction = computed(() => {
      const id: ClassAction = getters["teacherRoom/classAction"];
      return actions.find((e) => e.id === id) || actions[0];
    });

    const ctaVisible = ref(false);

    const onClickSelectAction = async (action: {
      id: ClassAction;
      icon: string;
    }) => {
      // classAction.value = action;
      await dispatch("teacherRoom/setClassAction", {
        action: ClassActionToValue(action.id),
      });
      ctaVisible.value = false;
    };

    const onClickContentView = async (payload: {
      x: number, y: number, contentId: string})=>{
      await dispatch("teacherRoom/teacherAnswer", payload);
    };

    const onHoverCTAButton = () => {
      ctaVisible.value = true;
    };
    const onClickToggleCTAContent = () => {
      ctaVisible.value = !ctaVisible.value;
    };
    const onClickOutSideCTAContent = () => {
      ctaVisible.value = false;
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
    const isConnected = computed(()=> getters['teacherRoom/isConnected']);
    watch(isConnected, async () => {
      if (!isConnected.value) return;
      await dispatch("teacherRoom/joinWSRoom");
    });
    return {
      actions,
      classAction,
      onClickSelectAction,
      showModal,
      onClickHideAll,
      onClickShowAll,
      onClickMuteAll,
      onClickUnmuteAll,
      onClickEnd,
      currentView,
      isGalleryView,
      setClassView,
      toggleView,
      teacher,
      onClickLeave,
      onClickCloseModal,
      isClassNotActive,
      onClickCloseError,
      onClickToggleCTAContent,
      onHoverCTAButton,
      onClickOutSideCTAContent,
      ctaVisible,
      isDesignatingTarget,
      allowDesignate,
      onClickContentView,
      modalDesignateTarget,
      classInfo
      // isGameView,
      // onUnityLoaderLoaded,
      // onUnityViewLoading,
      // onUnityViewLoaded
    };
  },
});
