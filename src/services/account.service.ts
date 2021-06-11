import { GLServiceBase, ServiceRoute } from "./base.service";

export class AccountService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "account/v1" };
}
