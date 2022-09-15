import { v4 as uuidv4 } from "uuid";
const transparentColor = "rgba(255,255,255,0.01)";

export const randomUUID = (prefix?: string): string => {
  return `${prefix ? prefix : ""}${uuidv4()}`;
};

enum DeviceType {
  Tablet = "tablet",
  Mobile = "mobile",
  Desktop = "desktop",
}

const deviceType = (): DeviceType => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return DeviceType.Tablet;
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return DeviceType.Mobile;
  }
  return DeviceType.Desktop;
};

export const isMobileBrowser = deviceType() === DeviceType.Mobile;
export const isDesktopBrowser = deviceType() === DeviceType.Desktop;

export enum DefaultCanvasDimension {
  width = 717,
  height = 435,
}
export function ratioValue(propImage: any, widthImg: number, heightImg: number, widthCanvas: number, heightCanvas: number) {
  let imgWidthCropFit, imgHeightCropFit;
  const objectFitCenter = 50;
  let widthMetadata, heightMetadata;
  if (propImage.metaData.width === 0 && propImage.metaData.height === 0) {
    widthMetadata = widthImg;
    heightMetadata = heightImg;
  } else {
    widthMetadata = propImage.metaData.width;
    heightMetadata = propImage.metaData.height;
  }
  const cropRatio = widthMetadata / heightMetadata;
  const canvasRatio = widthCanvas / heightCanvas;
  if (cropRatio > canvasRatio) {
    imgWidthCropFit = widthCanvas;
    imgHeightCropFit = widthCanvas / cropRatio;
  } else {
    imgWidthCropFit = heightCanvas * cropRatio;
    imgHeightCropFit = heightCanvas;
  }
  const imgLeftCrop = (widthCanvas - imgWidthCropFit) * (objectFitCenter / 100);
  const wRatio = imgWidthCropFit / widthMetadata;
  const hRatio = imgHeightCropFit / heightMetadata;
  const ratio = Math.min(wRatio, hRatio);

  const imageRatio = Math.max(
	widthImg / DefaultCanvasDimension.width,
	heightImg / DefaultCanvasDimension.height,
  );
  const max = widthImg / DefaultCanvasDimension.width === imageRatio ? 'x' : 'y';
  const renderWidth = widthImg / imageRatio;
  const renderHeight = heightImg / imageRatio;

  return { imgLeftCrop, ratio, max, renderWidth,renderHeight };
}

export function starPolygonPoints(spikeCount: any, outerRadius: any, innerRadius: any) {
  let rot = (Math.PI / 2) * 3;
  const cx = outerRadius;
  const cy = outerRadius;
  const sweep = Math.PI / spikeCount;
  const points = [];

  for (let i = 0; i < spikeCount; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    points.push({ x: x, y: y });
    rot += sweep;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    points.push({ x: x, y: y });
    rot += sweep;
  }
  return points;
}

export function setStrokeColor(canvas: any, event: any, color: any, group?: any) {
  if(group){
	group._objects.forEach((obj:any,index:number) => {
		if(obj.id !== 'lesson-img'){
			if (obj.tag === event.tag) {
				group.item(index).set("stroke", color);
				if (obj.realFill && obj.realOpacity) {
				  if (color !== "transparent") {
					group.item(index).set("fill", obj.realFill);
					group.item(index).set("opacity", obj.realOpacity);
				  } else {
					group.item(index).set("fill", transparentColor);
					group.item(index).set("opacity", 1);
				  }
				}
			  }
		}
	})
  }
  canvas.getObjects().forEach((obj: any) => {
    if (obj.tag === event.tag) {
      obj.set("stroke", color);
      if (obj.realFill && obj.realOpacity) {
        if (color !== "transparent") {
          obj.set("fill", obj.realFill);
          obj.set("opacity", obj.realOpacity);
        } else {
          obj.set("fill", transparentColor);
          obj.set("opacity", 1);
        }
      }
    }
  });
  canvas.renderAll();
}

export const getRadius = (width: number, height: number): number => {
  return Math.min(width, height) / 2;
};

export const getScaleX = (width: number, height: number): number => {
  const scaleX = Math.abs(width - height) / height + 1;
  const isScaleApplied = width > height;
  const defaultScaleX = 1;
  return isScaleApplied ? scaleX : defaultScaleX;
};
export const getScaleY = (width: number, height: number): number => {
  const scaleY = Math.abs(width - height) / width + 1;
  const isScaleYApplied = height > width;
  const defaultScaleY = 1;
  return isScaleYApplied ? scaleY : defaultScaleY;
};

export enum Tools {
  Cursor = "cursor",
  Pen = "pen",
  Laser = "laser",
  Stroke = "stroke",
  Delete = "delete",
  Clear = "clear",
  StrokeColor = "stroke-color",
  Circle = "circle",
  Square = "square",
  TextBox = "TextBox",
}

export function endImgLink(url: any) {
  if (typeof url !== "string") return false;
  return url.match(/\.(jpg|jpeg|gif|png|tiff|bmp)$/) != null;
}

export enum Mode {
  Cursor = 1,
  Draw = 2,
}

export enum ErrorCode {
  ConcurrentUserException = 1,
  StudentNotInClass = 5,
}
/* eslint-disable no-useless-escape */
export const mobileDevice =
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent,
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4),
  );
