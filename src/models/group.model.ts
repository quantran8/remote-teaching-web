
export interface SchoolClassTimeModel {
	id: string;
	start: string;
	end: string;
	type: number;
	day: any;
	daysOfWeek: number;
	duration: number;
  }

export interface SchoolClassTimeSchedulesModel {
  timeId: string;
  customizedScheduleId: string;
  start: string,
  end: string;
  type: number;
  dates: string[];
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
  schedules: SchoolClassTimeSchedulesModel[];
  studentCount: number;
  next?: string;
  isCurrentDay?: boolean;
  startClass?: boolean;
  isHighLighted?: boolean;
}
