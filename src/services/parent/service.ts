import { ParentServiceInterface } from "./interface";
import { GetChildrenModel } from "./model";

class ParentServiceClass implements ParentServiceInterface {
  // serviceRoute: ServiceRoute = { prefix: "admin/v1/parents" };
  // getChildren(parentId: string): Promise<GetChildrenModel> {
  //   return this.get(`/${parentId}/GetChildrenDetail`);
  // }

  getChildren(parentId: string): Promise<GetChildrenModel> {
    return Promise.reject(parentId);
  }
}

export const ParentService = new ParentServiceClass();
