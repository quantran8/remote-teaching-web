import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";
import { useStore } from "vuex";
import { FabricObject } from "@/ws";
import { ref } from "vue";

/* eslint-disable */
const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const defaultTextBoxProps = {
  left: 50,
  top: 50,
  width: 150,
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
  const { dispatch } = useStore();

  const isEditing = ref(false);
  const textBoxInvalidMsg = ref("");

  //listen event fire on canvas
  const onObjectCreated = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      if (options?.target.type === "textbox") {
        options.target.selectable = false;
      }
    });
  };
  const onObjectModified = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      console.log("onObjectModified", options);
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
        dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
        if (options?.target.text === "") {
          setTimeout(() => {
            canvas.remove(options.target);
          }, 0);
        }
      }
    });
    canvas.on("text:editing:entered", (options: any) => {
      if (options?.target.type === "textbox") {
        isEditing.value = true;
        // dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
      }
    });
    canvas.on("text:changed", (options: any) => {
      const hasInvalidText = format.test(options?.target.text);
      if (hasInvalidText) {
        textBoxInvalidMsg.value = `${options?.target.text} is invalid`;
      } else {
        textBoxInvalidMsg.value = "";
      }
    });
  };

  const createTextBox = (canvas: any, coords: { top: number; left: number; fill: string }) => {
    const textBox = new fabric.Textbox("", { ...defaultTextBoxProps, ...coords });
    // canvas.centerObject(textBox);
    const randomId = randomUUID();
    textBox.objectId = randomId;
    canvas.add(textBox).setActiveObject(textBox);
    textBox.enterEditing();
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
    textBoxInvalidMsg,
  };
};
