import { AdminService } from "../admin.service";
import { ParentServiceInterface } from "./interface";
class ParentServiceClass extends AdminService
  implements ParentServiceInterface {
  getChildren<T>(parentId: string): Promise<T> {
    return this.get(`${parentId}/GetChildrenDetail`);
  }
}

export const ParentService = new ParentServiceClass();
