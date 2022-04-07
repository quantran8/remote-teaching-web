export interface SchoolClassTimeModel {
  id: string;
  start: string;
  end: string;
  type: number;
  day: any;
  daysOfWeek: number;
  duration: number;
}

export interface SchoolClassTimeRecurringModel {
  timeId: string;
  start: string;
  end: string;
  daysOfWeek: number;
  duration: number;
}

export interface GroupModel {
  id: string;
  groupName: string;
  schedules: SchoolClassTimeModel[];
  studentCount: number;
  next?: string;
  isCurrentDay?: boolean;
  startClass?: boolean;
  isHighLighted?: boolean;
}

export interface GroupModelSchedules {
  groupId: string;
  groupName: string;
  studentCount: number;
  customizedScheduleId: string;
  timeId: string;
  timeStart: string;
  timeEnd: string;
  next?: string;
  isCurrentDay?: boolean;
  startClass?: boolean;
  isHighLighted?: boolean;
}
