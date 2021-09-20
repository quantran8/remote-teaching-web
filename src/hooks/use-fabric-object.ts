import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";
import { useStore } from "vuex";
import { FabricObject } from "@/ws";

const defaultTextBoxProps = {
  left: 50,
  top: 50,
  width: 150,
  fontSize: 36,
  fontFamily: "arial black",
};

export const useFabricObject = () => {
  const { dispatch } = useStore();

  const handleCreateObject = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      if (options?.target.type === "textbox") {
        options.target.selectable = false;
      }
    });
  };

  const handleModifyObject = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      if (options?.target.type === "textbox") {
        dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
      }
    });
  };

  const editTextBox = (canvas: any) => {
    canvas.on("text:editing:exited", (options: any) => {
      if (options?.target.type === "textbox") {
        dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
      }
    });
  };

  const createTextBox = (canvas: any) => {
    const textBox = new fabric.Textbox("Write here...", defaultTextBoxProps);
    canvas.centerObject(textBox);
    const randomId = randomUUID();
    textBox.objectId = randomId;
    canvas.add(textBox).setActiveObject(textBox);
    dispatch("teacherRoom/teacherCreateFabricObject", textBox);
  };

  const deserializeFabricObject = (item: FabricObject) => {
    const { fabricData, fabricId } = item;
    const fabricObject = JSON.parse(fabricData);
    fabricObject.objectId = fabricId;
    return fabricObject;
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
        existingItem.set(fabricObject);
        canvas.renderAll();
        break;
      default:
        break;
    }
  };

  return { handleCreateObject, createTextBox, editTextBox, handleModifyObject, displayFabricItems, displayCreatedItem, displayModifiedItem };
};
