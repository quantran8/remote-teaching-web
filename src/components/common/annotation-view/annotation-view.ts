import {computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch} from "vue";
import { useStore } from "vuex";
import {Pointer} from "@/store/annotation/state";
import {fabric} from "fabric";

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    const canvas: Ref<any> = ref(null);
    const scaleRatio = ref(1);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);

    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } =
        store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
      const boundingBox = imgAnnotation.getBoundingClientRect();
      const { width, height } = props.image;
      if (!width || !height) return;
      const wRatio = boundingBox.width / width;
      const hRatio = boundingBox.height / height;
      scaleRatio.value = Math.min(wRatio, hRatio);

      return `transform: translate(${pointer.x *
        scaleRatio.value}px, ${pointer.y * scaleRatio.value}px)`;
    });
    const imageUrl = computed(() => {
      return props.image ? props.image.url : {};
    });
    const boardSetup = () => {
      canvas.value = new fabric.Canvas("canvas");
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
      const boundingBox = imgAnnotation.getBoundingClientRect();
      canvas.value.setWidth(boundingBox.width);
      canvas.value.setHeight(boundingBox.height);
      canvas.value.selectionFullyContained = false;
    };
    onMounted(() => {
      boardSetup();
    });

    return { pointerStyle, imageUrl, isPointerMode };
  }
});
