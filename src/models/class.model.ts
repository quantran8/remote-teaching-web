import { GroupModel, GroupModelSchedules } from "./group.model";

export interface ClassModel {
  schoolId: string;
  schoolName: string;
  campusId: string;
  campusName: string;
  schoolClassId: string;
  schoolClassName: string;
  licenseType: number;
  age: string;
  studentCount: number;
  currentUnit: number;
  repTimePerWeek?: any;
  tsiTimePerWeek?: any;
  tsiLessonsPerWeek: number;
  repLessonsPerWeek?: any;
  tsi?: any;
  rep?: any;
  other?: any;
  regionId: string;
  regionName: string;
  regionEnglishName: string;
  remoteClassGroups: GroupModel[];
}

export interface ClassModelSchedules {
  classId: string;
  className: string;
  campusName: string;
  isTeacher: boolean;
  groups: GroupModelSchedules[];
}

export interface TeacherClassModel extends ClassModelSchedules {
  isActive?: boolean;
}

export interface TeacherClassCalendarModel extends ClassModel {
  isActive?: boolean;
}
