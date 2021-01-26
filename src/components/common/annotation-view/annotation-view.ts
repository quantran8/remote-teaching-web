import {computed, defineComponent, watch} from "vue";
import { useStore } from "vuex";
import {Pointer} from "@/store/annotation/state";

export default defineComponent({
  setup() {
    const store = useStore();
    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } =
        store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      return `transform: translate(${pointer.x}px, ${pointer.y}px)`;
    });
    return { pointerStyle };
  },
});
