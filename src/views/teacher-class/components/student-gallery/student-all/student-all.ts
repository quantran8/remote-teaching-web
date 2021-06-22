import { StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentCard from "../student-card/student-card.vue";

export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const store = useStore();
    const students: ComputedRef<StudentState[]> = computed(() => store.getters["teacherRoom/students"]);
    const topStudents = computed(() => students.value.slice(0, 12));
    const oneAndOneStatus = computed(() => store.getters["teacherRoom/getStudentModeOneId"]);

    const containerRef = ref<HTMLDivElement>();

    onMounted(() => {
      resizeGalleryView();
    });

    watch(topStudents, data => {
      resizeGalleryView();
    });

    const resizeGalleryView = () => {
      if (!containerRef.value) {
        return;
      }
      const count = topStudents.value.length;

      containerRef.value.style.gridTemplateColumns = "repeat(1, 70%)";

      if (count > 2) {
        containerRef.value.style.gridTemplateColumns = "repeat(2, 1fr)";
      }
      if (count > 6) {
        containerRef.value.style.gridTemplateColumns = "repeat(3, 1fr)";
      }
    };

    return {
      students,
      topStudents,
      oneAndOneStatus,
      containerRef,
    };
  },
});
