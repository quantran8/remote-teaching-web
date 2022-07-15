import { defineComponent, Ref, ref } from "vue";
import { fabric } from "fabric";
import { Tools } from "@/utils/utils";

export default defineComponent({
  setup() {
    const canvas: Ref<any> = ref(null);
    const tools = Tools;
    const strokeColor: Ref<string> = ref("#000000");
    const strokeWidth: Ref<number> = ref(3);
    const toolSelected: Ref<string> = ref("");

    // Tool Selection
    const clickedTool = (tool: string) => {
      switch (tool) {
        case Tools.Pen:
          canvas.value.freeDrawingBrush.color = strokeColor.value;
          canvas.value.freeDrawingBrush.width = strokeWidth.value;
          return;
        case Tools.Clear:
          canvas.value.remove(...canvas.value.getObjects());
          return;
      }
    };

    const listenToMouseDown = () => {
      canvas.value.on("mouse:down", (event: any) => {
        const mouse = canvas.value.getPointer(event.e);
        return mouse;
      });
    };

    const listenToMouseMove = () => {
      canvas.value.on("mouse:move", (event: any) => {
        const mouse = canvas.value.getPointer(event.e);
        return mouse;
      });
    };

    const listenToMouseUp = () => {
      canvas.value.on("mouse:up", async (event: any) => {
        // const mouse = canvas.value.getPointer(event.e);
        return canvas.value.renderAll();
      });
    };

    // LISTENING TO CANVAS EVENTS
    const listenToCanvasEvents = () => {
      listenToMouseDown();
      listenToMouseMove();
      listenToMouseUp();
    };

    const updateColorValue = (value: any) => {
      if (toolSelected.value === Tools.StrokeColor) {
        strokeColor.value = value.hex;
        if (canvas.value.getActiveObject()) {
          canvas.value.getActiveObject().set("stroke", strokeColor.value);
          canvas.value.renderAll();
        }
      }
    };

    const updateStrokeWidth = (value: number) => {
      strokeWidth.value = value;
      if (canvas.value.getActiveObject()) {
        canvas.value.getActiveObject().set("strokeWidth", strokeWidth.value);
        canvas.value.renderAll();
      }
    };

    // Board setup
    const boardSetup = () => {
      // Set up Fabric.js canvas
      canvas.value = new fabric.Canvas("canvas");
      clickedTool(Tools.Pen);
      canvas.value.setWidth(window.innerWidth);
      canvas.value.setHeight(window.innerHeight);
      canvas.value.selectionFullyContained = false;
      fabric.Object.prototype.set({
        transparentCorners: false,
        borderColor: "#63CBAB",
        cornerColor: "#87E5CA",
      });

      listenToCanvasEvents();
    };

    return {
      boardSetup,
      updateColorValue,
      updateStrokeWidth,
    };
  },
});
