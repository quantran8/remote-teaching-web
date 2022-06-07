import { ClassView, TeacherState } from "@/store/room/interface";
import { Modal, notification, Checkbox } from "ant-design-vue";
import { computed, ComputedRef, defineComponent, ref, watch, provide, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import PreventEscFirefox from "../prevent-esc-firefox/prevent-esc-firefox.vue";
import { fmtMsg, RoleName, LoginInfo } from "vue-glcommonui";
import { ErrorCode } from "@/utils/utils";
import { TeacherClass } from "./../../locales/localeid";
import { UserRole } from "@/store/app/state";

const fpPromise = FingerprintJS.load();
import {
  TeacherCard,
  LessonPlan,
  ActivityContent,
  StudentGallery,
  GlobalAudioBar,
  DesignateTarget,
  TeacherPageHeader,
  WhiteboardPalette,
} from "./components";
import { ClassRoomStatus } from "@/models";
export default defineComponent({
  components: {
    Modal,
    Checkbox,
    PreventEscFirefox,
    TeacherCard,
    LessonPlan,
    ActivityContent,
    GlobalAudioBar,
    StudentGallery,
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
    const loginInfo: LoginInfo = getters["auth/getLoginInfo"];
    const classRoomState = computed(() => getters["classRoomStatus"]);
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
      if (classRoomState.value === ClassRoomStatus.InDashBoard) {
        await dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
      }
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
    const isLessonPlan = computed(() => getters["teacherRoom/classView"] === ClassView.LESSON_PLAN);
    const currentExposureItemMedia = computed(() => getters["lesson/currentExposureItemMedia"]);
    const students = computed(() => getters["teacherRoom/students"]);
    const roomInfo = computed(() => {
      return getters["teacherRoom/info"];
    });
    const currentView = computed(() => {
      return getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return getters["teacherRoom/isGalleryView"];
    });
    const isOneOneMode = ref("");
    const oneAndOneStatus = computed(() => getters["teacherRoom/getStudentModeOneId"]);
    watch(oneAndOneStatus, (value) => {
      if (value === "" || value === null) {
        isOneOneMode.value = "";
      } else {
        isOneOneMode.value = value;
      }
    });
    const isBlackOutContent = computed(() => getters["lesson/isBlackOut"]);

    const isSidebarCollapsed = ref<boolean>(true);
    watch(isGalleryView, (value) => {
      isSidebarCollapsed.value = value;
    });

    const modalVisible = ref(false);
    const cbMarkAsCompleteValueRef = ref<boolean>(false);

    const leavePageText = computed(() => fmtMsg(TeacherClass.LeavePage));
    const leaveNoticeText = computed(() => fmtMsg(TeacherClass.LeaveNotice));
    const markAsCompleteText = computed(() => {
      if (roomInfo.value === undefined) return null;
      const {
        classInfo: { className: classname, unit, lesson },
      } = roomInfo.value;
      return fmtMsg(TeacherClass.MarkAsComplete, {
        lesson,
        unit,
        classname,
      });
    });

    const cbMarkAsCompleteValue = computed(() => cbMarkAsCompleteValueRef.value);
    // const isGameView = computed(() => {
    //   return getters["teacherRoom/isGameView"];
    // });
    // Logger.log(isGameView.value, 'game view');

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
      await dispatch("teacherRoom/setClearBrush", {});
      await dispatch("teacherRoom/setWhiteboard", { isShowWhiteBoard: false });
    };

    const showHideLesson = ref(false);
    const toggleLessonSidebar = (value: boolean) => {
      showHideLesson.value = value;
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

    const showModal = () => {
      modalVisible.value = true;
    };

    const resetModal = () => {
      modalVisible.value = false;
      cbMarkAsCompleteValueRef.value = false;
    };

    const markAsCompleteChanged = (e: any) => {
      cbMarkAsCompleteValueRef.value = e.target.checked;
    };

    const handleOk = async () => {
      try {
        await dispatch("setClassRoomStatus", { status: ClassRoomStatus.InDashBoard });
        await dispatch("teacherRoom/endClass", { markAsComplete: cbMarkAsCompleteValueRef.value });
        await dispatch("lesson/clearLessonData");
        await dispatch("lesson/clearCacheImage");
        await dispatch("teacherRoom/setClearBrush", {});
        await router.push("/teacher");
      } catch (err) {
        Modal.destroyAll();
        const message = err?.body?.message;
        notification.error({
          message: `${message}`,
        });
      }

      resetModal();
    };

    const handleCancel = () => {
      resetModal();
    };

    const onClickEnd = async () => {
      showModal();
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
    //   Logger.info("onUnityLoaderLoaded");
    // };
    // const onUnityViewLoading = (progress: number) => {
    //   Logger.info("onUnityViewLoading", progress);
    // };
    // const onUnityViewLoaded = () => {
    //   Logger.info("onUnityViewLoaded");
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
          notification.error({
            message: err.message,
          });
        }
      }
    });

    watch(teacher, async () => {
      if (!teacher.value) return;
      await dispatch("teacherRoom/getAvatarTeacher", { teacherId: teacher.value.id });
    });
    watch(students, async () => {
      if (!students.value) return;
      const studentIds = students.value.map((student: any) => {
        return student.id;
      });
      await dispatch("teacherRoom/setAvatarAllStudent", { studentIds });
    });

    provide("isSidebarCollapsed", isSidebarCollapsed);
    const updateUserRoleByView = (payload: UserRole) => {
      dispatch("setUserRoleByView", payload);
    };
    onMounted(() => {
      updateUserRoleByView(UserRole.Teacher);
    });
    onUnmounted(() => {
      updateUserRoleByView(UserRole.UnConfirm);
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
      isOneOneMode,
      modalVisible,
      handleOk,
      handleCancel,
      leavePageText,
      leaveNoticeText,
      markAsCompleteText,
      cbMarkAsCompleteValue,
      markAsCompleteChanged,
      toggleLessonSidebar,
      showHideLesson,
    };
  },
});
