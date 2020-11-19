import { GLServiceBase, ServiceRoute } from "./service";

export class AdminService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "admin/v1/parents" };

  getChildren<T>(parentId: string): Promise<T> {
    return this.get(`${parentId}/GetChildrenDetail`);
  }
}
