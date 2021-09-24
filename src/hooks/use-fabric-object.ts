import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";
import { useStore } from "vuex";
import { FabricObject } from "@/ws";
import { ref, watch, computed } from "vue";

/* eslint-disable */
const specialCharactersRegex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const WarningTiming = 1500;

const defaultTextBoxProps = {
  left: 50,
  top: 50,
  width: 100,
  fontSize: 36,
  fill: "black",
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
  const showWarningMsg = ref(false);

  watch(showWarningMsg, (currentValue: any) => {
    if (currentValue) {
      setTimeout(() => {
        showWarningMsg.value = false;
      }, WarningTiming);
    }
  });

  const isEditing = ref(false);
  //listen event fire on canvas
  const onObjectCreated = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      if (options?.target.type === "textbox" && !isTeacher) {
        options.target.selectable = false;
      }
      if (options?.target.type === "path") {
        options.target.selectable = false;
        options.target.hoverCursor = "default";
        canvas.renderAll();
      }
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
        isEditing.value = true;
        options.target.setSelectionStart(0);
        options.target.setSelectionEnd(options.target.text.length);
        // dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
      }
    });
    canvas.on("text:changed", (options: any) => {
      if (!options.target.textIsChanged) {
        options.target.textIsChanged = true;
      }
      const hasInvalidText = specialCharactersRegex.test(options?.target.text);
      if (hasInvalidText) {
        showWarningMsg.value = true;
        const filteredText = options.target.text.replace(/[^\w\s]/gi, "");
        options.target.text.replace(/[^\w\s]/gi, "");
        options.target.set("text", filteredText);
        options.target.hiddenTextarea.value = filteredText;
        //set the current cursor to the last character
        options.target.setSelectionStart(options.target.text.length);
        options.target.setSelectionEnd(options.target.text.length);
        //prevent scale the width
        options.target.set({ width: 100 });
      }
    });
  };

  const createTextBox = (canvas: any, coords: { top: number; left: number; fill: string }) => {
    const textBox = new fabric.Textbox("", { ...defaultTextBoxProps, ...coords });
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
          canvas.add(new fabric.Textbox("", fabricObject));
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
      case "textbox":
        canvas.add(new fabric.Textbox("", fabricObject));
        break;
      default:
        break;
    }
  };

  const displayModifiedItem = (canvas: any, item: FabricObject, existingItem: any) => {
    const fabricObject = deserializeFabricObject(item);
    const { type } = fabricObject;
    switch (type) {
      case "textbox":
        fabricObject.text = `${fabricObject.text}\n`;
        existingItem.set(fabricObject);
        canvas.renderAll();
        break;
      default:
        break;
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
    showWarningMsg,
  };
};
