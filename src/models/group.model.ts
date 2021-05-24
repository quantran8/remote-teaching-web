export interface GroupModel {
  id: string;
  groupName: string;
  schoolClassTimeDto: SchoolClassTimeModel[];
  studentCount: number;
  next?: string;
  isCurrentDay?: boolean;
}

export interface SchoolClassTimeModel {
  id: string;
  start: string;
  end: string;
  type: number;
  day: any;
  daysOfWeek: number;
  duration: number;
}
