import {computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch} from "vue";
import { useStore } from "vuex";
import { fabric } from "fabric";
import * as R from "ramda/";

export default defineComponent({
  props: ["image"],
  setup(props) {
    const store = useStore();
    let canvas: any;
    const stickerColors = ["red", "yellow", "blue", "green", "pink"];
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

    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);

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
    const undoCanvas = computed(() => store.getters["annotation/undoShape"]);
    const canvasData = computed(() => store.getters["annotation/shapes"]);

    const renderCanvas = () => {
      if (!canvas || !canvasData.value) return;
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

      canvas.loadFromJSON(
        JSON.stringify(canvasJsonData),
        canvas.renderAll.bind(canvas)
      );
    };
    watch(undoCanvas, renderCanvas);
    watch(canvasData, renderCanvas);
    const stickersData = computed(() => store.getters["annotation/stickers"]);
    const stickerRender = () => {
      if (stickersData.value.length) {
        stickersData.value.forEach((obj: any) => {
          const rectSticker = new fabric.Rect({
            top: 10 * scaleRatio.value,
            left: 10 * scaleRatio.value,
            width: obj.width * scaleRatio.value,
            height: obj.height * scaleRatio.value,
            objectCaching: false,
            fill: "#000",
            opacity: 0.35,
            hasControls: false,
            hasBorders: false
          });
          canvas.add(rectSticker);
        });
      }
    };
    if (canvas) {
      stickerRender();
    }
    watch(stickersData, stickerRender);

    const boardSetup = () => {
      canvas = new fabric.Canvas("canvas");
      if (!props.image) return;
      const imgAnnotation = document.getElementById("annotation-img");
      if (!imgAnnotation) return;
      const boundingBox = imgAnnotation.getBoundingClientRect();
      canvas.setWidth(boundingBox.width);
      canvas.setHeight(boundingBox.height);
      canvas.selectionFullyContained = false;
      canvas.getObjects("path").forEach((obj: any) => {
        obj.selectable = false;
      });

      renderCanvas();
      stickerRender();
    };

    const changeColorSticker = (stickerColor: string) => {
      if (stickersData.value.length) {
        canvas.getObjects("rect").forEach((obj: any) => {
          obj.fill = stickerColor;
        });
        canvas.renderAll();
      }
    };

    const checkStickerAdded = () => {
      canvas.renderAll();
      stickersData.value.forEach((data: any) => {
        canvas.getObjects("rect").forEach((obj: any) => {
          if (
            data.width === Math.round(obj.width / scaleRatio.value) &&
            data.height === Math.round(obj.height / scaleRatio.value)
          ) {
            if (
              !(
                data.top * 0.95 <= Math.round(obj.top / scaleRatio.value) &&
                Math.round(obj.top / scaleRatio.value) <=
                  data.top + data.top * 0.15 &&
                data.left * 0.95 <= Math.round(obj.left / scaleRatio.value) &&
                Math.round(obj.left / scaleRatio.value) <=
                  data.left + data.left * 0.15
              )
            ) {
              canvas.remove(obj);
              obj.set({
                top: 10 * scaleRatio.value,
                left: 10 * scaleRatio.value
              });
              canvas.add(obj);
              canvas.renderAll();
            }
          }
        });
      });
    };

    const canvasRef = ref(null);
    onMounted(() => {
      calcScaleRatio();
      boardSetup();
      window.addEventListener("resize", calcScaleRatio);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", calcScaleRatio);
    });

    return {
      pointerStyle,
      imageUrl,
      isPointerMode,
      isDrawMode,
      canvasRef,
      stickerColors,
      checkStickerAdded,
      changeColorSticker
    };
  }
});
