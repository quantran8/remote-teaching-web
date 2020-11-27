import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
  },
  async created() {
    const store = useStore();
    const route = useRoute();
    const { studentId } = route.params;
    store.dispatch("studentRoom/setUser", {
      id: studentId,
      name: "",
    });
    await store.dispatch("studentRoom/loadRooms");
    await store.dispatch("studentRoom/joinRoom");
  },
  async beforeUnmount() {
    const store = useStore();
    await store.dispatch("studentRoom/leaveRoom");
  },

  setup() {
    const store = useStore();
    const student = computed(() => store.getters["studentRoom/student"]);
    const teacher = computed(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);

    const audioIcon = computed(() =>
      student.value?.audioEnabled ? "icon-audio-on" : "icon-audio-off"
    );
    const videoIcon = computed(() =>
      student.value?.videoEnabled ? "icon-video-on" : "icon-video-off"
    );

    const toggleAudio = () => {
      // store.dispatch("teacherRoom/setTeacherAudio", {
      //   teacherId: props.id,
      //   audioEnabled: !props.audioEnabled,
      // });
    };

    const toggleVideo = () => {
      // store.dispatch("teacherRoom/setTeacherVideo", {
      //   teacherId: props.id,
      //   videoEnabled: !props.videoEnabled,
      // });
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
