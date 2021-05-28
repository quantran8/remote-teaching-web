export interface CalendarSchedulesModel {
  day: string;
  schedules: SchedulesModel[];
}

export interface SchedulesModel {
  id: string;
  classId: string;
  className: string;
  groupId: string;
  groupName: string;
  duration: number;
  end: string;
  start: string;
  customizedScheduleId: string;
}
