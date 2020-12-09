import { LoginInfo, RoleName } from "@/commonui";
import { GLError, GLErrorCode } from "@/models/error.model";
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

    const toggleAudio = () => {
      store.dispatch("studentRoom/setStudentAudio", {
        id: student.value.id,
        enable: !student.value.audioEnabled,
      });
    };

    const toggleVideo = () => {
      store.dispatch("studentRoom/setStudentVideo", {
        id: student.value.id,
        enable: !student.value.videoEnabled,
      });
    };

    return {
      student,
      students,
      teacher,
      audioIcon,
      videoIcon,
      toggleAudio,
      toggleVideo,
    };
  },
});
