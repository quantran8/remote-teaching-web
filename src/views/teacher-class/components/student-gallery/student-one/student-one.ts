import { StudentState, TeacherState } from "@/store/room/interface";
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
      () => store.getters["modeOne/getStudentModeOneId"]
    );
    const teacher: ComputedRef<TeacherState> = computed(
      () => store.getters["teacherRoom/teacher"]
    );
    const studentOne = students.value.filter(student => { return student.id === studentOneAndOneId.value }).shift();

    const setVideoStudent = async (status: boolean, id: string) => {
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

    const setVideoTeacher = async (status: boolean) => {
      if (!teacher.value) {
        return;
      }
      await store.dispatch("teacherRoom/setTeacherAudio", {
        id: teacher.value.id,
        enable: status,
      });
      await store.dispatch("teacherRoom/setTeacherVideo", {
        id: teacher.value.id,
        enable: status,
      });
    }

    students.value.map(student => {
      if (student.id !== studentOneAndOneId.value) {
        setVideoStudent(false, student.id);
      }
    })

    const backToClass = async () => {
      if (studentOne) {
        await setVideoStudent(true, studentOne.id);
        await setVideoStudent(false, studentOne.id);
        await setVideoTeacher(false);
        await setVideoTeacher(true);
        await store.dispatch("modeOne/clearStudentOneId", { id: '' });
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
