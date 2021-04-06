import { computed, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import StudentAll from "./student-all/student-all.vue";
import StudentOne from "./student-one/student-one.vue";

export default defineComponent({
  components: {
    StudentAll,
    StudentOne,
  },
  setup() {
    const { getters } = useStore();
    const oneAndOneStatus = computed(
      () => getters["modeOne/getStudentModeOneId"]
    );
    return {
      oneAndOneStatus,
    };
  },
});