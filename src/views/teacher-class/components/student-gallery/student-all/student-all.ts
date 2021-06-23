import { StudentState } from "@/store/room/interface";
import student from "@/store/room/student";
import { computed, ComputedRef, defineComponent, ref, provide } from "vue";
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
    const focusedStudent = ref<string>("");
    const updateFocusStudent = (studentId?: string) => {
      if (studentId) {
        return (focusedStudent.value = studentId);
      }
      focusedStudent.value = "";
    };

    provide("updateFocusStudent", updateFocusStudent);

    return {
      students,
      topStudents,
      oneAndOneStatus,
      focusedStudent,
    };
  },
});
