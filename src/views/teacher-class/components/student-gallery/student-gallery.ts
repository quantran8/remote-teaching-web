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
    const studentViewModels: Ref<StudentViewModel[]> = ref([]);
    const students: ComputedRef<Array<StudentState>> = computed(
      () => getters["teacherRoom/students"]
    );
    const studentSelecteds: ComputedRef<Array<StudentId>> = computed(
      () => getters["interactive/studentsSelected"]
    );
    const targets: ComputedRef<Array<Target>> = computed(
      () => getters["interactive/targets"]
    );

    watch([students, studentSelecteds, targets], () => {
      studentViewModels.value = students.value.map((s) => {
        let status = InteractiveStatus.DEFAULT;
        let correct = 0;
        let multiAssign = false;
        const selectedStudent = studentSelecteds.value.find(
          (st) => st.id === s.id
        );
        if (selectedStudent) {
          correct = selectedStudent.answerList.length;
          status =
            correct === targets.value.length
              ? InteractiveStatus.COMPLETED
              : InteractiveStatus.ASSIGNED;
          multiAssign = studentSelecteds.value.length > 1;
        }
        return {
          ...s,
          interactive: {
            correct: correct,
            status: status,
            multiAssign: multiAssign
          },
        };
      });
    });
    return {
      studentViewModels,
    };
  },
});
