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
    const students: ComputedRef<Array<StudentState>> = computed(
      () => store.getters["teacherRoom/students"]
    );

    const toggleVideoAudio = async (id: string, audioStatus: boolean, videoStatus: boolean) => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: id,
        enable: audioStatus,
      });
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: id,
        enable: videoStatus,
      });
    }

    const setDefaultVideoStudent = async () => {
      students.value.map(student => {
        toggleVideoAudio(student.id, false, false);
        setTimeout(() => {
          toggleVideoAudio(student.id, true, true);
        },300)
      })
    }

    setDefaultVideoStudent();
    
    return {
      students
    };
  },
});
