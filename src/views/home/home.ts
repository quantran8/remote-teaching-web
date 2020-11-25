import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  created() {
    const store = useStore();
    const isOnlyParent = store.getters["auth/isOnlyParent"];
    const isOnlyTeacher = store.getters["auth/isOnlyTeacher"];
    const router = useRouter();
    if (isOnlyParent) {
      router.replace("/student");
    } else if (isOnlyTeacher) {
      router.replace("/teacher");
    }
  },
  setup() {
    const store = useStore();
    const username = computed(() => store.getters["auth/username"]);
    return {
      username,
    };
  },
});
