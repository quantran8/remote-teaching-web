import { v4 as uuidv4 } from "uuid";

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
