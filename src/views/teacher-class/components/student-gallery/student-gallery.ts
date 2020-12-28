import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import StudentCard from "./student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const { getters } = useStore();
    const students = computed(() => getters["teacherRoom/students"]);
    return {
      students,
    };
  },
});
