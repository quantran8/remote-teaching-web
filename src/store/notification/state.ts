export enum NotificationType {
  Warning = "Warning",
  Success = "Success",
  Failed = "Failed",
}

export interface Notification {
  type: NotificationType;
  duration: number;
  message: string;
  id: string;
}

export interface NotificationState {
  notifications: Notification[];
}

const state: NotificationState = {
  notifications: [],
};

export default state;
