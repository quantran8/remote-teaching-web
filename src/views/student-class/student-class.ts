import { LoginInfo, RoleName } from "@/commonui";
import { GLError, GLErrorCode } from "@/models/error.model";
import { ClassView } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
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
    const student = computed(() => store.getters["studentRoom/student"]);
    const teacher = computed(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);
    const designateTargets = computed(
      () => store.getters["interactive/targets"]
    );
    const isLessonPlan = computed(
      () => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN
    );
    const errors: ComputedRef<GLError> = computed(
      () => store.getters["studentRoom/error"]
    );

    watch(errors, () => {
      if (errors.value) {
        if (errors.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE) {
          window.confirm(errors.value.message);
          router.replace("/");
        } else if (
          errors.value.errorCode === GLErrorCode.CLASS_HAS_BEEN_ENDED
        ) {
          window.confirm(errors.value.message);
          router.replace("/");
        }
      }
    });

    const audioIcon = computed(() =>
      student.value?.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      student.value?.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

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
    const isBlackOutContent = computed(
      () => store.getters["lesson/isBlackOut"]
    );
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
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
    const classAction = computed(
      () => store.getters["studentRoom/classAction"]
    );
    const isConnected = computed(
      () => store.getters["studentRoom/isConnected"]
    );
    watch(isConnected, async () => {
      if (!isConnected.value) return;
      await store.dispatch("studentRoom/joinWSRoom");
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
    };
  },
});
