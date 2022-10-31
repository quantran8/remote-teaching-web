import {AdminService} from "@/services";
class GLPermissionService extends AdminService {
    getPermissionNames(roleIds: any) {
        return this.get("permissions/names", roleIds);
    }
}

export const PermissionService = new GLPermissionService();
