import { fabric } from "fabric";

export const laserPen = (laserPath: any, canvas: any, oneOneStatus: any, studentOneAndOneId: any, student: any) => {
  if (laserPath.value) {
	if(!studentOneAndOneId.value || studentOneAndOneId.value === student.value.id){
		const laserPathLine = new fabric.Polyline.fromObject({points:laserPath.value.points}, (item: any) => {
			item.fill = "transparent";
			item.stroke = laserPath.value.strokeColor
			item.strokeWidth = laserPath.value.strokeWidth
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
			   if(laserPath.value.isDone){
				  canvas.remove(item);
			   }
			  },
			});
		  });
	}
  }
};
