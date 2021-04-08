import { GroupModel } from "./group.model";

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
  groups?: GroupModel[];
}

export interface TeacherClassModel extends ClassModel {
  isActive?: boolean;
}
