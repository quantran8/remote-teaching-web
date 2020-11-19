import { computed, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const store = useStore();
    const children = computed(() => store.getters["parent/children"]);
    const username = computed(() => store.getters["auth/username"]);
    watch(children, () => {
      console.log("Children", children.value);
    });
    return { children, username };
  },
});
