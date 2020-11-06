import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const username = computed(() => store.getters["auth/username"]);
    return {
      username,
    };
  },
});
