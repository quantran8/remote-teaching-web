import { StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent } from "vue";
import { useStore } from "vuex";
import { InteractiveStatus } from "../student-card/student-card";
import StudentCard from "../student-card/student-card.vue";
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
    const store = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(
      () => store.getters["teacherRoom/students"]
    );
    const studentOneAndOneId = computed(
      () => store.getters["teacherRoom/studentOneAndOneId"]
    );
    const studentOne = students.value.filter(student => { return student.id === studentOneAndOneId.value }).shift();

    const setDefault = async (status: boolean, id: string) => {
      if (studentOne) {
        await store.dispatch("teacherRoom/setStudentAudio", {
          id: id,
          enable: status,
        });
        await store.dispatch("teacherRoom/setStudentVideo", {
          id: id,
          enable: status,
        });
      }
    }

    students.value.map(student => {
      console.log(student.id !== studentOneAndOneId.value);
      if (student.id !== studentOneAndOneId.value) {
        setDefault(false, student.id);
      }
    })

    const backToClass = async () => {
      if (studentOne) {
        setDefault(false, studentOne.id);
        setTimeout(()=> {
          setDefault(true, studentOne.id);
        },200)
        await store.dispatch("teacherRoom/sendOneAndOne", {
          status: false,
          id: null,
        });
      }
    };

    return {
      backToClass,
      studentOne
    };
  },
});
