import { fabric } from "fabric";
import { useStore } from "vuex";
import { computed } from "vue";
import { starPolygonPoints } from "commonui";

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
  const addStar = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
    const points = starPolygonPoints(5, 35, 15);
    const star = new fabric.Polygon(points, {
      stroke: strokeColor.value,
      left: 0,
      top: 0,
      strokeWidth: strokeWidth.value,
      strokeLineJoin: "round",
      fill: "",
      id: isTeacher.value.id,
      isOneToOne: oneAndOne.value || null,
    });
    canvas.add(star);
    canvas.setActiveObject(star);
    await teacherAddShapes(canvas);
  };
  const addCircle = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
    const circle = new fabric.Circle({
      left: 0,
      top: 0,
      radius: 30,
      fill: "",
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      id: isTeacher.value.id,
      isOneToOne: oneAndOne.value || null,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    await teacherAddShapes(canvas);
  };
  const addSquare = async (canvas: any, strokeColor: any, strokeWidth: any, oneAndOne: any) => {
    const square = new fabric.Rect({
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      fill: "",
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      id: isTeacher.value.id,
      isOneToOne: oneAndOne.value || null,
    });
    canvas.add(square);
    canvas.setActiveObject(square);
    await teacherAddShapes(canvas);
  };
  return {
    teacherAddShapes,
    addStar,
    addCircle,
    addSquare,
  };
};