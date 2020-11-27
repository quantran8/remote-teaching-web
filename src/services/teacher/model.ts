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