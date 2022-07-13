import { GetChildrenModel } from "./model";

export interface ParentServiceInterface {
  getChildren(parentId: string): Promise<GetChildrenModel>;
  getGSConnectAccess(): Promise<boolean>;
}
