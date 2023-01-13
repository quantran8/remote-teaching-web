export interface ChildModel {
  id: string;
  name: string;
  englishName: string;
  schoolId: string;
  schoolName: string;
  schoolClassId: string;
  schoolClassName: string;
  campusId: string;
  campusName: string;
  groupId?: string;
  groupName?: string;
}

export interface GetChildrenModel {
  updateTime: any;
  children: Array<ChildModel>;
}
