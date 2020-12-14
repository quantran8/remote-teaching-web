import { ClassView } from "../interface";

export interface UserIdPayload {
  id: string;
}
export interface UserMediaPayload {
  id: string;
  enable: boolean;
}
export interface DeviceMediaPayload {
  enable: boolean;
}

export interface StudentBadgePayload {
  id: string;
  badge: number;
}

export interface ClassViewPayload {
  classView: ClassView;
}

export type DefaultPayload = any;
