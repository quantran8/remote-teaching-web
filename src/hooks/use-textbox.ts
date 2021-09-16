import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";

export const useTextBox = () => {
  const handleCreateObject = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      const canvasObject = options.target;
      if (canvasObject.type === "textbox") {
        const randomId = randomUUID();
        canvasObject.objectId = randomId;
        canvasObject.set("fill", "red");
      }
    });
  };

  const handleModifyObject = (canvas: any) => {
    canvas.on("object:modified", (options: any) => {
      console.log("handleModifyObject", options?.target);
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
    canvas.add(textBox).setActiveObject(textBox);
    canvas.renderAll();
  };

  const editTextBox = (canvas: any) => {
    canvas.on("text:changed", (textBox: any) => {
      console.log("textBoxId", textBox.target.objectId);
    });
  };

  return { handleCreateObject, createTextBox, editTextBox, handleModifyObject };
};
