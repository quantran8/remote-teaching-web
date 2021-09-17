import { computed, watch } from "vue";
import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";
import { useStore } from "vuex";
import { FabricObject } from "@/ws";

export const useTextBox = () => {
  const { dispatch, getters } = useStore();

  const handleCreateObject = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      console.log("object: added");
      //   const canvasObject = options.target;
      //   if (canvasObject.type === "textbox") {
      //     const randomId = randomUUID();
      //     canvasObject.objectId = randomId;
      //     dispatch("teacherRoom/teacherCreateFabricObject", canvasObject);
      //   }
    });
  };

  const handleModifyObject = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      console.log("handleModifyObject", options?.target);
      dispatch("teacherRoom/teacherModifyFabricObject", options?.target);
    });
  };

  const editTextBox = (canvas: any) => {
    canvas.on("text:changed", (options: any) => {
      console.log("textBoxId", options.target.objectId);
      dispatch("teacherRoom/teacherModifyFabricObject", options.target);
    });
  };

  const createTextBox = (canvas: any) => {
    const textBox = new fabric.Textbox("Type here...", {
      left: 50,
      top: 50,
      width: 150,
      fontSize: 36,
      fontFamily: "arial black",
    });
    canvas.centerObject(textBox);
    const randomId = randomUUID();
    textBox.objectId = randomId;
    canvas.add(textBox).setActiveObject(textBox);
    dispatch("teacherRoom/teacherCreateFabricObject", textBox);
  };

  const displayFabricItems = (canvas: any, items: FabricObject[]) => {
    for (const item of items) {
      const { fabricData, fabricId } = item;
      const fabricObject = JSON.parse(fabricData);
      fabricObject.objectId = fabricId;
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

  return { handleCreateObject, createTextBox, editTextBox, handleModifyObject, displayFabricItems };
};
