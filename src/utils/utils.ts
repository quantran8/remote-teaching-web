import { v4 as uuidv4 } from "uuid";

export const randomUUID = (prefix?: string): string => {
  return `${prefix ? prefix : ""}${uuidv4()}`;
};
