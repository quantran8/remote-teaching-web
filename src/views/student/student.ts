import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const children = computed(() => store.getters["parent/children"]);
    return { children };
  },
});
