import { v4 as uuidv4 } from "uuid";

export const randomUUID = (prefix?: string): string => {
  return `${prefix ? prefix : ""}${uuidv4()}`;
};

export const changeDataImage = (dataImage: string): string => {
  if (dataImage.includes("http")) {
    return dataImage;
  } else {
    return `data:image/png;base64,${dataImage}`;
  }
};
