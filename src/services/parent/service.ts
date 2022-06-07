import { AdminService } from "../admin.service";
import { ParentServiceInterface } from "./interface";
class ParentServiceClass extends AdminService implements ParentServiceInterface {
  getChildren<T>(parentId: string): Promise<T> {
    return this.get(`parents/${parentId}/GetChildrenDetail`);
  }
}

export const ParentService = new ParentServiceClass();
