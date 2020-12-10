import { LoginInfo, RoleName } from "@/commonui";
import { GLErrorCode } from "@/models/error.model";
import { ClassView, TeacherState } from "@/store/room/interface";
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
    const teacher: ComputedRef<TeacherState> = computed(
      () => getters["teacherRoom/teacher"]
    );
    const error = computed(() => getters["teacherRoom/error"]);
    const isClassNotActive = computed(() => {
      return (
        error.value && error.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE
      );
    });

    const views = [
      { id: ClassView.GALLERY, name: "Gallery", icon: "" },
      { id: ClassView.LESSON_PLAN, name: "LessonPlan", icon: "" },
      { id: ClassView.WHITE_BOARD, name: "Whiteboard", icon: "" },
      { id: ClassView.GAME, name: "Game", icon: "" },
    ];

    const currentView = computed(() => {
      return getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return getters["teacherRoom/isGalleryView"];
    });

    const setClassView = async (newView: ClassView) => {
      await dispatch("teacherRoom/setClassView", { classView: newView });
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

    return {
      showModal,
      onClickHideAll,
      onClickShowAll,
      onClickMuteAll,
      onClickUnmuteAll,
      onClickEnd,
      currentView,
      isGalleryView,
      setClassView,
      views,
      teacher,
      onClickLeave,
      onClickCloseModal,
      isClassNotActive,
      onClickCloseError,
    };
  },
});
