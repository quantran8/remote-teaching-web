import { defineComponent } from "vue";
import { useStore } from "vuex";
import StudentCard from "./student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const { getters } = useStore();
    const students = getters["class/students"];
    return {
      students,
    };
  },
});
