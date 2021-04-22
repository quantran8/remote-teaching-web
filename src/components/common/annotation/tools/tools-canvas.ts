import { defineComponent, Ref, ref, watch } from "vue";
import { Tools } from "@/commonui";
import { times } from "lodash";

export default defineComponent({
  emits: ["tool-selected", "update-color", "update-stroke"],
  props: {
    toolSelected: {
      type: String,
      default: "cursor"
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
  data() {
	return {
		showFontWeightPopover: false,
	}
  },
  setup(props, { emit }) {
    const tools = Tools;
    const toolNames: string[] = Object.values(tools);	
    const toolsWithDropdown = [Tools.Stroke, Tools.StrokeColor];
    const toolNameMap = {
      [Tools.Cursor]: "Cursor",
      [Tools.Pen]: "Pen",
      [Tools.Stroke]: "Size",
      [Tools.Delete]: "Delete Brush Stroke",
      [Tools.Clear]: "Clear Brush Strokes",
      [Tools.AddSticker]: "Add Sticker",
      [Tools.AssignSticker]: "Assign Sticker",
	  [Tools.StrokeColor]: "Color"
    };

    const colors: any = {};
	//currently the design just have 6 color belows
    const colorsList = [
      "black",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
    //   "blue",
    //   "purple",
    //   "gray",
    //   "white"
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
      strokeSize,
    };
  },
  methods: {
	  checkHasIcon(toolName: any) {
		const {Cursor, Pen, Delete, Clear, Stroke} = Tools;
		const iconList = [Cursor, Pen, Delete, Clear, Stroke] 
		if(iconList.includes(toolName)) return true
		return false
	  },
	  handleIconClick(toolName: any) {
		  if(toolName === Tools.Stroke) {
			this.showFontWeightPopover = !this.showFontWeightPopover
		  }
	  }
  }
});
