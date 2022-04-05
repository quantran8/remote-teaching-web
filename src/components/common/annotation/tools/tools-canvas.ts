import { defineComponent, Ref, ref, watch } from "vue";
import { Tools } from "@/utils/utils";
import { Divider, Popover, Row, Space, Icon } from "ant-design-vue";

export default defineComponent({
  emits: ["tool-selected", "update-color", "update-stroke"],
  props: {
    toolSelected: {
      type: String,
      default: "cursor",
    },
    selectorOpen: {
      type: Boolean,
      default: false,
    },
    strokeWidth: {
      type: Number,
      default: 2,
    },
    strokeColor: {
      type: String,
      default: "#000000",
    },
    stickerTool: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Row,
    Divider,
    Popover,
    Space,
    Icon,
  },
  setup(props, { emit }) {
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);
    const toolsWithDropdown = [Tools.Stroke, Tools.StrokeColor];
    const toolNameMap = {
      [Tools.Cursor]: "Cursor",
      [Tools.Pen]: "Pen",
      [Tools.Laser]: "Laser Pen",
      [Tools.Stroke]: "Size",
      [Tools.Delete]: "Delete Brush Stroke",
      [Tools.Clear]: "Clear Brush Strokes",
      [Tools.StrokeColor]: "Color",
      [Tools.TextBox]: "TextBox",
    };
    const showListColors = ref<boolean>(false);
    const showListSize = ref<boolean>(false);
    const colors: any = {};
    //currently the design just have 8 color belows
    const colorsList = ["black", "red", "orange", "yellow", "green", "blue", "purple", "white"];
    const strokeSize = [2, 4];
    const clickedTool = (toolName: string) => {
      emit("tool-selected", toolName);
    };
    const updateColor = (value: string) => {
      emit("update-color", value);
    };
    const updateStrokeSize = (value: number) => {
      emit("update-stroke", value);
    };
    const hideListSize = () => {
      showListSize.value = false;
    };
    const hideListColors = () => {
      showListColors.value = false;
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
      strokeSize,
      showListColors,
      showListSize,
      hideListColors,
      hideListSize,
    };
  },
});
