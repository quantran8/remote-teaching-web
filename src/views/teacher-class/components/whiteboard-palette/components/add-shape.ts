import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";
import { starPolygonPoints } from "@/utils/utils";

export const addShape = () => {
  const store = useStore();
  const isTeacher = computed(() => store.getters["teacherRoom/teacher"]);

  const teacherAddShapes = async (canvas: any) => {
    const shapes: Array<string> = [];
    canvas.getObjects().forEach((obj: any) => {
      if (obj.id === isTeacher.value.id && obj.type !== "path") {
        obj = obj.toJSON();
        obj.id = isTeacher.value.id;
        shapes.push(JSON.stringify(obj));
      }
    });
    if (shapes.length) {
      await store.dispatch("teacherRoom/setShapesForStudent", shapes);
    }
  };
  const addCircle = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
	const initTopLeftXY = 30 + strokeWidth.value
	const circle = new fabric.Circle({
      left: initTopLeftXY,
      top: initTopLeftXY,
      radius: 30,
      fill: "",
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      id: isTeacher.value.id,
      isOneToOne: oneAndOne.value || null,
	  originX: "center",
	  originY: "center",
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    await teacherAddShapes(canvas);
  };
  const addSquare = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
	const initTopLeftXY = 25 + strokeWidth.value
	const square = new fabric.Rect({
      left: initTopLeftXY,
      top: initTopLeftXY,
      width: 50,
      height: 50,
      fill: "",
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      id: isTeacher.value.id,
      isOneToOne: oneAndOne.value || null,
	  originX: "center",
	  originY: "center",
    });
    canvas.add(square);
    canvas.setActiveObject(square);
    await teacherAddShapes(canvas);
  };
  return {
    teacherAddShapes,
    addCircle,
    addSquare,
  };
};
