import { GLServiceBase, ServiceRoute } from "./service";

class ResourceService extends GLServiceBase<any, any> {
  serviceRoute = {
    prefix: "account/v1/users",
  };
  getRemoteTsiSettings() {
    return this.get("HasGSConnectAccess");
  }
}

export default new ResourceService();
