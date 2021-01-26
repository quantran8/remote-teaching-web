import {computed, defineComponent, watch} from "vue";
import { useStore } from "vuex";
import {Pointer} from "@/store/annotation/state";

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    const updatePointerRatio = () => {
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
    };
    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } =
        store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      return `transform: translate(${pointer.x}px, ${pointer.y}px)`;
    });
    const imageUrl = computed(() => {
      return props.image ? props.image.url : {};
    });

    return { pointerStyle, imageUrl };
  }
});
