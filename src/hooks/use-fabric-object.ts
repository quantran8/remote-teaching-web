import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";
import { useStore } from "vuex";
import { FabricObject } from "@/ws";
import { ref, computed } from "vue";
import FontFaceObserver from "fontfaceobserver";
const FontDidactGothic = "Didact Gothic";
const FontLoader = new FontFaceObserver(FontDidactGothic);

// eslint-disable-next-line
fabric.Textbox.prototype._wordJoiners = /[]/;

const defaultTextBoxProps = {
  left: 50,
  top: 50,
  fontSize: 36,
  fill: "black",
  padding: 5,
  fontFamily: "Didact Gothic",
};

const deserializeFabricObject = (item: FabricObject) => {
  const { fabricData, fabricId } = item;
  const fabricObject = JSON.parse(fabricData);
  fabricObject.objectId = fabricId;
  return fabricObject;
};

export const useFabricObject = () => {
  const { dispatch, getters } = useStore();
  const isTeacher = computed(() => getters["auth/isTeacher"]);
  const nextColor = ref("");

  const isEditing = ref(false);
  //listen event fire on canvas
  const onObjectCreated = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      const handleSelect = () => {
        if (options?.target.type === "textbox" && !isTeacher.value) {
          options.target.selectable = false;
        }
        if (options?.target.type === "path") {
          options.target.selectable = false;
          options.target.perPixelTargetFind = true;
          options.target.hoverCursor = "default";
        }
      };
      handleSelect();
    });
  };
  const onObjectModified = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      if (options?.target?.type === "textbox") {
        dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
        if (options?.target.text === "") {
          canvas.remove(options.target);
        }
      }
    });
  };
  const onTextBoxEdited = (canvas: any) => {
    canvas.on("text:editing:exited", (options: any) => {
      if (options?.target.type === "textbox") {
        if (options?.target.textIsChanged) {
          dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
        }
        if (options?.target.text === "" || !options?.target.textIsChanged) {
          setTimeout(() => {
            canvas.remove(options.target);
          }, 0);
        }
      }
    });
    canvas.on("text:editing:entered", (options: any) => {
      if (options?.target.type === "textbox") {
        options.target.set("cursorColor", nextColor.value);
        isEditing.value = true;
        options.target.setSelectionStart(0);
        options.target.setSelectionEnd(options.target.text.length);
      }
    });

    canvas.on("text:changed", (options: any) => {
      // adjust textbox size when remove characters
      if (options.target instanceof fabric.IText) {
        const maxLength = Math.max(...options.target.textLines.map((line: string) => line.length));
        options.target.set({ width: maxLength });
      }

      if (!options.target.textIsChanged) {
        options.target.textIsChanged = true;
      }
      if (nextColor.value) {
        const selectedTextStyles = options.target.getSelectionStyles(options.target.selectionEnd - 1, options.target.selectionEnd, true);
        const [style] = selectedTextStyles;
        if (style.fill !== nextColor.value) {
          options.target.setSelectionStart(options.target.selectionEnd - 1);
          options.target.setSelectionEnd(options.target.selectionEnd);
          options.target.setSelectionStyles({ fill: nextColor.value });
          options.target.setSelectionStart(options.target.selectionEnd);
          options.target.setSelectionEnd(options.target.selectionEnd);
        }
      }
      dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
    });
  };

  const createTextBox = (canvas: any, coords: { top: number; left: number }) => {
    const textBox = new fabric.Textbox("", { ...defaultTextBoxProps, ...coords, fill: nextColor.value });
    const randomId = randomUUID();
    textBox.objectId = randomId;
    canvas.add(textBox).setActiveObject(textBox);
    textBox.textIsChanged = false;
    textBox.enterEditing();
    textBox.setSelectionStart(0);
    textBox.setSelectionEnd(textBox.text.length);
    dispatch("teacherRoom/teacherCreateFabricObject", textBox);
    return textBox;
  };

  //display the fabric items get from getRoomInfo API which save in vuex store
  const displayFabricItems = (canvas: any, items: FabricObject[]) => {
    for (const item of items) {
      const currentObjects = canvas.getObjects();
      const existing = currentObjects.find((obj: any) => obj.objectId === item.fabricId);
      if (existing) return;
      const fabricObject = deserializeFabricObject(item);
      const { type } = fabricObject;
      switch (type) {
        case "textbox":
          FontLoader.load().then(() => {
            canvas.add(new fabric.Textbox("", fabricObject));
          });
          break;
        default:
          break;
      }
    }
  };

  //display the fabric item get from signalR TeacherCreateFabricObject/TeacherModifyFabricObject
  //which save in vuex store as lastFabricUpdated
  const displayCreatedItem = (canvas: any, item: FabricObject) => {
    const fabricObject = deserializeFabricObject(item);
    const { type } = fabricObject;
    switch (type) {
      case "textbox": {
        const emptyTextBox = canvas.getObjects().find((obj: any) => obj.type === "textbox" && !obj.text);
        if (emptyTextBox) {
          canvas.remove(emptyTextBox);
        }
        canvas.add(new fabric.Textbox("", fabricObject));
        break;
      }
      default:
        break;
    }
  };

  const displayModifiedItem = (canvas: any, item: FabricObject, existingItem: any) => {
    const fabricObject = deserializeFabricObject(item);
    const { type } = fabricObject;
    switch (type) {
      case "textbox":
        //two lines below fix the bug the text not display when texts's width not equal the Box's width (it can be fabric issue)
        if (fabricObject.text.length === 1) fabricObject.width = 0;
        fabricObject.text = `${fabricObject.text}\n`;
        existingItem.set(fabricObject);
        canvas.renderAll();
        break;
      default:
        break;
    }
  };

  const handleUpdateColor = (canvas: any, colorValue: string) => {
    const selectedFabricObject = canvas.getActiveObject();
    nextColor.value = colorValue;
    if (selectedFabricObject?.type === "textbox") {
      const hasSelected = selectedFabricObject.selectionEnd - selectedFabricObject.selectionStart > 0;
      if (hasSelected) {
        selectedFabricObject.setSelectionStyles({ fill: colorValue });
        dispatch("teacherRoom/teacherModifyFabricObject", selectedFabricObject);
      }
      selectedFabricObject.set("cursorColor", colorValue);
      canvas.renderAll();
    }
  };

  return {
    onObjectCreated,
    createTextBox,
    onTextBoxEdited,
    onObjectModified,
    displayFabricItems,
    displayCreatedItem,
    displayModifiedItem,
    isEditing,
    nextColor,
    handleUpdateColor,
  };
};