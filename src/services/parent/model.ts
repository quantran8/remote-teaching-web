export interface ChildModel {
  id: string;
  name: string;
  englishName: string;
  schoolClassId: string;
  schoolClassName: string;
}

export interface GetChildrenModel {
  updateTime: any;
  children: Array<ChildModel>;
}
