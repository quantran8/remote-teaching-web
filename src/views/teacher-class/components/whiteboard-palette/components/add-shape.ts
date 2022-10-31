import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";
import { DefaultCanvasDimension } from "vue-glcommonui";

export const addShape = () => {
  const store = useStore();
  const isTeacher = computed(() => store.getters["teacherRoom/teacher"]);
  const isTeacherUseOnly = computed(() => store.getters["teacherRoom/isTeacherUseOnly"]);

  const teacherAddShapes = async (canvas: any) => {
    const shapes: Array<string> = [];
    canvas.getObjects().forEach((obj: any) => {
      if (obj.id === isTeacher.value.id && obj.type !== "path") {
        obj = obj.toJSON();
        obj.id = isTeacher.value.id;
        shapes.push(JSON.stringify(obj));
      }
    });
    if (shapes.length && !isTeacherUseOnly.value) {
      await store.dispatch("teacherRoom/setShapesForStudent", shapes);
    }
  };
  const addCircle = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
	const initTopLeftX = (0 + strokeWidth.value) + DefaultCanvasDimension.width / 2;
	const initTopLeftY = (0 + strokeWidth.value) + DefaultCanvasDimension.height / 2;
	const circle = new fabric.Circle({
      left: initTopLeftX,
      top: initTopLeftY,
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
	const initTopLeftX = (0 + strokeWidth.value) + DefaultCanvasDimension.width / 2;
	const initTopLeftY = (0 + strokeWidth.value) + DefaultCanvasDimension.height / 2;
	const square = new fabric.Rect({
      left: initTopLeftX,
      top: initTopLeftY,
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
