export interface GroupModel {
  id: string;
  name: string;
  schoolClassId: string;
  students?: any[];
  studentCount: number;
  nextSchedule: Date;
}
