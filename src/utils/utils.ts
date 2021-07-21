import { v4 as uuidv4 } from "uuid";

export const randomUUID = (prefix?: string): string => {
  return `${prefix ? prefix : ""}${uuidv4()}`;
};

export const formatImageUrl = (dataImage: string): string => {
  return dataImage.includes("http") ? dataImage : `data:image/png;base64,${dataImage}`;
};
