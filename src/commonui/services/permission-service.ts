import { ResourceType } from "../utils";
import { ServiceRoute, GLServiceBase } from "./service";
import { isUndefined } from "lodash";

export type ResourcePropagation = {
  resourceType: ResourceType;
  resourceKey: string;
};
class PermissionServiceClass extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "content/v1/vcs" };

  getPermissions(userId?: string) {
    if (isUndefined(userId)) {
      return this.request.get(this.url("permissions"));
    } else {
      return this.get("permissions", { userId: userId });
    }
  }

  saveUserPermissions(userId: string | null, allowedPermissions: number[]) {
    return this.create("{userId}/savepermission", allowedPermissions, {
      userId: userId,
    });
  }

  removepermission(userId: string) {
    return this.create("{userId}/removepermission", null, { userId: userId });
  }
}

export const PermissionService = new PermissionServiceClass();
