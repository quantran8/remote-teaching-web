// import { GLServiceBase, ServiceRoute } from "@/commonui";
import { IParentService } from "./interface";
import { GetChildrenModel } from "./model";

class ParentServiceClass implements IParentService {
  getChildren(parentId: string): Promise<GetChildrenModel> {
    return Promise.reject(parentId);
  }
}
// class ParentServiceClass extends GLServiceBase<any, any>
//   implements IParentService {
//   serviceRoute: ServiceRoute = { prefix: "admin/v1/parents" };
//   getChildren(parentId: string): Promise<GetChildrenModel> {
//     return this.get(`/${parentId}/GetChildrenDetail`);
//   }
// }

export const ParentService = new ParentServiceClass();
