import { GLServiceBase, ServiceRoute } from "./base.service";

export class AdminService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "admin/v1/parents" };
}
