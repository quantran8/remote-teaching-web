import { GLServiceBase, ServiceRoute } from "./base.service";

export class ContentService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "content/v1" };
}
