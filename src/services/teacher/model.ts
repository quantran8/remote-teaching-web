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
  isCampusDetail?: boolean;
  disabled?: boolean;
  sortBy?: string;
}

export interface GetAccessibleClassResponseModel {
  data: Array<AccessibleClassModel>;
  totalCount: number;
}

export interface AccessibleClassModel {
  schoolClassId: string;
  schoolClassName: string;
  campusId: string;
  campusName: string;
}
