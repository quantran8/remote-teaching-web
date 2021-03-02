import { defineComponent, Ref, ref, watch } from "vue";
import { Tools } from "@/commonui";

export default defineComponent({
  emits: ["tool-selected", "update-color", "update-stroke"],
  props: {
    toolSelected: {
      type: String,
      default: ""
    },
    selectorOpen: {
      type: Boolean,
      default: false
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    strokeColor: {
      type: String,
      default: "#000000"
    },
    stickerTool: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);
    const toolsWithDropdown = [Tools.Stroke, Tools.StrokeColor];
    const toolNameMap = {
      [Tools.Pen]: "Pen",
      [Tools.Stroke]: "Size",
      [Tools.StrokeColor]: "Color",
      [Tools.Delete]: "Delete Brush Stroke",
      [Tools.Clear]: "Clear Brush Strokes",
      [Tools.AddSticker]: "Add Sticker",
      [Tools.AssignSticker]: "Assign Sticker"
    };
    const colors: any = {};
    const colorsList = [
      "black",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "gray",
      "white"
    ];
    const strokeSize = [2, 6, 10];
    const clickedTool = (toolName: string) => {
      emit("tool-selected", toolName);
    };
    const updateColor = (value: any) => {
      emit("update-color", value);
    };
    const updateStrokeSize = (value: number) => {
      emit("update-stroke", value);
    };
    return {
      tools,
      toolNames,
      toolsWithDropdown,
      toolNameMap,
      colors,
      colorsList,
      clickedTool,
      updateColor,
      updateStrokeSize,
      strokeSize
    };
  }
});
