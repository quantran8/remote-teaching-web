import { ClassModel } from "@/models";

export interface GetClassesModel {
  extraData: {
    activeCount: number;
    futureCount: number;
    totalCount: number;
  };
  data: Array<ClassModel>;
  totalCount: number;
}

export interface AccessibleSchoolQueryParam {
  regionId?: string;
  disabled?: boolean;
}

export interface ScheduleParam {
  id?: string;
  schoolClassId?: string;
  groupId?: string;
  start?: string;
  end?: string;
  type?: string;
  createdBy?: string;
}
