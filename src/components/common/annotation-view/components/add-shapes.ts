import { fabric } from "fabric";
import { useStore } from "vuex";
import { starPolygonPoints } from "@/utils/utils";

export const studentAddedShapes = () => {
  const store = useStore();
  const randomPosition = () => Math.random() * 100;

  const studentAddShapes = (canvas: any, student: any) => {
    const shapes: Array<string> = [];
    canvas.getObjects().forEach((obj: any) => {
      if (obj.id === student.value.id && obj.type !== "path") {
        obj = obj.toJSON();
        obj.id = student.value.id;
        shapes.push(JSON.stringify(obj));
      }
    });
    if (shapes.length) {
      store.dispatch("studentRoom/studentAddShape", shapes).then();
    }
  };
  const processPushShapes = (canvas: any, student: any, oneOneStatus: any, studentOneAndOneId: any) => {
    if (oneOneStatus.value) {
      if (studentOneAndOneId.value === student.value.id) {
        studentAddShapes(canvas, student);
      }
    } else {
      studentAddShapes(canvas, student);
    }
  };
  const addCircle = (canvas: any, toolActive: any, student: any, activeColor: any, studentOneAndOneId: any) => {
    if (!canvas) return;
    toolActive.value = "circle";
    const circle = new fabric.Circle({
      left: randomPosition(),
      top: randomPosition(),
      radius: 30,
      fill: "",
      stroke: activeColor.value,
      strokeWidth: 3,
      id: student.value.id,
      isOneToOne: studentOneAndOneId.value || null,
    });
    canvas.isDrawingMode = false;
    canvas.add(circle);
    canvas.setActiveObject(circle);
    studentAddShapes(canvas, student);
  };
  const addSquare = (canvas: any, toolActive: any, student: any, activeColor: any, studentOneAndOneId: any) => {
    if (!canvas) return;
    toolActive.value = "square";
    const square = new fabric.Rect({
      left: randomPosition(),
      top: randomPosition(),
      width: 50,
      height: 50,
      fill: "",
      stroke: activeColor.value,
      strokeWidth: 3,
      id: student.value.id,
      isOneToOne: studentOneAndOneId.value || null,
    });
    canvas.isDrawingMode = false;
    canvas.add(square);
    canvas.setActiveObject(square);
    studentAddShapes(canvas, student);
  };
  return {
    processPushShapes,
    addCircle,
    addSquare,
  };
};
