import { StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent } from "vue";
import { useStore } from "vuex";
import StudentCard from "../student-card/student-card.vue";

export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const store = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(() => store.getters["teacherRoom/students"]);
    const topStudents = computed(() => students.value.slice(0, 12));
    const oneAndOneStatus = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);

    return {
      students,
      topStudents,
      oneAndOneStatus,
    };
  },
});
