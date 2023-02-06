import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {},
  emits: ["show-all", "hide-all", "mute-all", "unmute-all", "end"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const helperId = computed(() => getters["teacherRoom/helperId"]);
    return {
      helperId,
    };
  },
});
