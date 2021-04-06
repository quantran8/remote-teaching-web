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

export interface AccessibleClassQueryParam {
  offset?: number;
  limit?: number;
  schoolId?: string;
  campusId?: string;
  ignoreFutureClass?: boolean;
  isDetail?: boolean;
  disabled?: boolean;
}

export interface AccessibleClassModel {
  id: string;
  name: string;
  campusId: string;
  campusName: string;
}
