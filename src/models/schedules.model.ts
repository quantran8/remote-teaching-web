export interface CalendarSchedulesModel {
  day: string;
  schedules: SchedulesModel[];
}

export interface SchedulesModel {
  classId: string;
  className: string;
  groupId: string;
  groupName: string;
  duration: number;
  end: string;
  start: string;
  customizedScheduleId: string;
  isHistory: boolean;
}
