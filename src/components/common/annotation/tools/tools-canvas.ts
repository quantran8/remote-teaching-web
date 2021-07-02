import { defineComponent, Ref, ref, watch } from "vue";
import { Tools } from "@/commonui";

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
    };
    const showColorsPopover = ref<boolean>(false);
    const showFontWeightPopover = ref<boolean>(false);
    const colors: any = {};
    //currently the design just have 8 color belows
    const colorsList = ["black", "red", "orange", "yellow", "green", "blue", "purple", "white"];
    const strokeSize = [2, 4];
    const clickedTool = (toolName: string) => {
      emit("tool-selected", toolName);
      if (toolName !== Tools.StrokeColor) {
        showColorsPopover.value = false;
      }
      if (toolName !== Tools.Stroke) {
        showFontWeightPopover.value = false;
      }
    };
    const updateColor = (value: any) => {
      emit("update-color", value);
    };
    const updateStrokeSize = (value: number) => {
      emit("update-stroke", value);
    };
    const handleToolClick = (toolName: string) => {
      if (toolName === Tools.StrokeColor) {
        showColorsPopover.value = !showColorsPopover.value;
        showFontWeightPopover.value = false;
      }
    };

    const customIconStyle = (toolName: string) => {
      switch (toolName) {
        case tools.Laser:
          return { width: "45px", height: "45px", paddingBottom: "5px", paddingLeft: "5px" };
        case tools.Stroke:
          return { width: "40px", height: "40px" };
        case tools.Square:
          return { width: "27px", height: "27px" };
        case tools.Circle:
          return { width: "28px", height: "28px" };
        default:
          return;
      }
    };

    const handleIconClick = (toolName: any) => {
      if (toolName === Tools.Stroke) {
        showFontWeightPopover.value = !showFontWeightPopover.value;
        showColorsPopover.value = false;
      }
    };

    const hideColorsPopover = () => {
      showColorsPopover.value = false;
    };

    const hideFontWeightPopover = () => {
      showFontWeightPopover.value = false;
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
      showColorsPopover,
      showFontWeightPopover,
      handleToolClick,
      customIconStyle,
      hideColorsPopover,
      hideFontWeightPopover,
      handleIconClick,
    };
  },
  methods: {
    checkHasIcon(toolName: any) {
      const { Cursor, Pen, Laser, Delete, Clear, Star, Circle, Square, Stroke } = Tools;
      const iconList = [Cursor, Pen, Laser, Delete, Clear, Star, Circle, Square, Stroke];
      return iconList.includes(toolName);
    },
  },
});
