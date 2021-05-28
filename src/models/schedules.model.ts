export interface CalendarSchedulesModel {
  day: string;
  schedules: SchedulesModel[];
}

export interface SchedulesModel {
  id: string;
  class: { id: string; name: string };
  group: { id: string; name: string };
  duration: number;
  end: string;
  start: string;
  customizedScheduleId: string;
}
