import { LoginInfo, RoleName } from "@/commonui";
import { RoomManager } from "@/manager/room/base.manager";
import { GLErrorCode } from "@/models/error.model";
import { ClassView } from "@/store/room/interface";
import {
  computed,
  ComputedRef,
  defineComponent,
  ref,
  toRef,
  watch,
  watchEffect,
} from "vue";
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
    const store = useStore();
    const router = useRouter();
    const showModal = ref(false);
    const hasConfirmed = ref(false);
    const teacher = computed(() => store.getters["teacherRoom/teacher"]);
    const error = computed(() => store.getters["teacherRoom/error"]);
    const roomManager = computed(
      () => store.getters["teacherRoom/roomManager"]
    );
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
      return store.getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return store.getters["teacherRoom/isGalleryView"];
    });

    const setClassView = (newView: ClassView) => {
      store.dispatch("teacherRoom/setClassView", { classView: newView });
    };

    const onClickHideAll = () => {
      store.dispatch("teacherRoom/hideAllStudents");
    };

    const onClickShowAll = () => {
      store.dispatch("teacherRoom/showAllStudents");
    };

    const onClickMuteAll = () => {
      store.dispatch("teacherRoom/muteAllStudents");
    };

    const onClickUnmuteAll = () => {
      store.dispatch("teacherRoom/unmuteAllStudents");
    };

    const onClickEnd = () => {
      showModal.value = true;
    };

    const onClickLeave = async () => {
      hasConfirmed.value = true;
      await store.dispatch("teacherRoom/endClass");
      router.replace("/teacher");
    };
    const onClickCloseError = () => {
      // store.dispatch("teacherRoom/setError", null);
      // does nothing, we only accept leave room;
    };
    const onClickCloseModal = () => {
      showModal.value = false;
    };

    const onTeacherChanged = async () => {
      console.log("on teacher changed", teacher.value);
      if (!roomManager.value) return;

      roomManager.value.setCamera({
        enable: teacher.value.videoEnabled,
        publish: teacher.value.videoEnabled,
      });

      roomManager.value.setMicrophone({
        enable: teacher.value.audioEnabled,
      });
    };

    watch(teacher, onTeacherChanged, { deep: true });

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
