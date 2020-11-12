import { GetChildrenModel } from "./model";

export interface IParentService {
  getChildren(parentId: string): Promise<GetChildrenModel>;
}
