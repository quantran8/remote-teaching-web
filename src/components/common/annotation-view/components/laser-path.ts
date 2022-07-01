import { fabric } from "fabric";

export const laserPen = (laserPath: any, canvas: any, oneOneStatus: any, studentOneAndOneId: any, student: any) => {
  if (laserPath.value) {
	const laserData = JSON.parse(laserPath.value)

    const laserPathLine = new fabric.Polyline.fromObject({points:laserData.points}, (item: any) => {
	  item.fill = "transparent";
	  item.stroke = laserData.strokeColor
	  item.strokeWidth = laserData.strokeWidth
	  canvas.add(item);
      item.animate("opacity", `0`, {
        duration: 1000,
        easing: fabric.util.ease.easeInOutExpo,
        onChange: () => {
          if (oneOneStatus.value) {
            if (studentOneAndOneId.value === student.value.id) {
              canvas.add(item);
            }
          }
        },
        onComplete: async () => {
         if(laserData.isDone){
			canvas.remove(item);
		 }
        },
      });
    });
  }
};
