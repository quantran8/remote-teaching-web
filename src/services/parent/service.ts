import { AdminService } from "../admin.service";
import { ParentServiceInterface } from "./interface";
class ParentServiceClass extends AdminService implements ParentServiceInterface {
  getChildren<T>(parentId: string): Promise<T> {
    return this.get(`parents/gsconnect-children`);
  }
  getGSConnectAccess(): Promise<boolean> {
    return this.get(`parents/gsconnect-access`);
  }
}

export const ParentService = new ParentServiceClass();
