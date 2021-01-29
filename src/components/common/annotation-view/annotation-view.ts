import {computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch} from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    const canvas: Ref<any> = ref(null);
    const scaleRatio = ref(1);
    const calcScaleRatio = () => {
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
      const boundingBox = imgAnnotation.getBoundingClientRect();
      const { width, height } = props.image;
      if (!width || !height) return;
      const wRatio = boundingBox.width / width;
      const hRatio = boundingBox.height / height;
      scaleRatio.value = Math.min(wRatio, hRatio);
      return scaleRatio;
    };

    const isPointerMode = computed(
      () => store.getters["annotation/isPointerMode"]
    );
    console.log(isPointerMode.value);

    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    console.log(isDrawMode.value);

    const pointerStyle = computed(() => {
      const pointer: { x: number; y: number } =
        store.getters["annotation/pointer"];
      if (!pointer) return `display: none`;
      return `transform: translate(${pointer.x *
        scaleRatio.value}px, ${pointer.y * scaleRatio.value}px)`;
    });
    const imageUrl = computed(() => {
      return props.image ? props.image.url : {};
    });

    const canvasData = computed(() => store.getters["annotation/shapes"]);
    console.log(canvasData.value);

    const renderCanvas = () => {
      if (!canvas.value || !canvasData.value) return;
      const shapes: Array<string> = canvasData.value;
      const canvasJsonData = {
        objects: shapes
          .map((s) => {
            const obj = JSON.parse(s);
            obj.width = Math.floor(obj.width * scaleRatio.value);
            obj.height = Math.floor(obj.height * scaleRatio.value);
            obj.top = Math.floor(obj.top * scaleRatio.value);
            obj.left = Math.floor(obj.left * scaleRatio.value);
            obj.scaleX = obj.scaleX * scaleRatio.value;
            obj.scaleY = obj.scaleY * scaleRatio.value;
            return obj;
          })
          .filter((s) => s !== null),
      };
      canvas.value.loadFromJSON(
        JSON.stringify(canvasJsonData),
        canvas.value.renderAll.bind(canvas.value)
      );
    };
    watch(canvasData, renderCanvas);

    const boardSetup = () => {
      canvas.value = new fabric.Canvas("canvas");
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
      const boundingBox = imgAnnotation.getBoundingClientRect();
      canvas.value.setWidth(boundingBox.width);
      canvas.value.setHeight(boundingBox.height);
      canvas.value.selectionFullyContained = false;
      canvas.value.getObjects().forEach((obj: any) => {
        obj.selectable = false;
      });

      renderCanvas();
    };
    const canvasRef = ref(null);
    onMounted(() => {
      boardSetup();
      calcScaleRatio();
      window.addEventListener("resize", calcScaleRatio);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", calcScaleRatio);
    });

    return { pointerStyle, imageUrl, isPointerMode,isDrawMode, canvasRef };
  }
});
