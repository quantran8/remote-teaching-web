import { fabric } from "fabric";
import { randomUUID } from "@/utils/utils";

export const useTextBox = () => {
  const addObjectIdentifier = (canvas: any) => {
    canvas.on("object:added", (options: any) => {
      const canvasObject = options.target;
      if (canvasObject.type === "textbox") {
        const randomId = randomUUID();
        canvasObject.id = randomId;
      }
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
      console.log("textBoxId", textBox.target.id);
    });
  };

  return { addObjectIdentifier, createTextBox, editTextBox };
};
