import { GLServiceBase, ServiceRoute } from "./service";

class ResourceService extends GLServiceBase<any, any> {
  serviceRoute = {
    prefix: "admin/v1/resources",
    itemSuffix: "{id}",
    suffix: "{resourceId}",
  };

  getRemoteTsiSettings() {
    return this.get("remotetsisettings");
  }
}

export default new ResourceService();
