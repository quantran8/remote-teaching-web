import { StudentId, Target } from "@/store/interactive/state";
import { StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { InteractiveStatus } from "./student-card/student-card";
import StudentCard from "./student-card/student-card.vue";
interface StudentViewModel extends StudentState {
  interactive: {
    correct: number;
    status: InteractiveStatus;
    multiAssign: boolean;
  };
}
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const { getters } = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(
      () => getters["teacherRoom/students"]
    );
    return {
      students,
    };
  },
});
