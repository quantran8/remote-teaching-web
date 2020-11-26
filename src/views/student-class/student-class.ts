import { StudentState } from "@/store/student_room/state";
import { computed, defineComponent, watch } from "vue";
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
  setup() {
    const store = useStore();
    const student: StudentState = store.getters["studentRoom/student"];
    const students: StudentState = store.getters["studentRoom/students"];
    const roomInfo = computed(() => store.getters["studentRoom/info"]);

    watch(roomInfo, () => {
      console.log("roomInfo", roomInfo);
    });

    return {
      student,
      students,
    };
  },
});
