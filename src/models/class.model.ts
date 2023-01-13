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
  schoolId?: string;
  classId: string;
  className: string;
  campusName: string;
  campusId: string;
  isTeacher: boolean;
  startDate: string;
  endDate: string;
  groups: GroupModelSchedules[];
  lessonNumber: number;
  unit: number;
  schoolName: string;
}
export interface ClassGroupModel {
  startDate: string;
  endDate: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  unit: number;
  lesson: number;
  groups: Array<{
    groupId: string;
    groupName: string;
  }>;
}

export interface UnitAndLesson {
  unit: number;
  sequence: number[];
  unitId: number;
}

export interface TeacherClassModel extends ClassModelSchedules {
  isActive?: boolean;
}

export interface TeacherClassCalendarModel extends ClassModel {
  isActive?: boolean;
}
