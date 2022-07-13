import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, RoleName, LoginInfo } from "vue-glcommonui";
import { ParentService } from "@/services";
import { store } from "@/store";
export default (to: RouteLocationNormalized, _from: RouteLocationNormalized, _next: NavigationGuardNext) => {
  const requireParent: boolean = to.matched.some((record) => record.meta.requireParent);
  if (!requireParent) return true;
  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (loginInfo && loginInfo.profile) {
    const isParent = loginInfo.profile.roles.indexOf(RoleName.parent) !== -1;
    return isParent;
  } else {
    return false;
  }
};

export const checkGSConnectPermission4Parent = async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  let canAccess = true;
  if (to?.name === "ParentHome" || (to?.name === "StudentClass" && from?.name !== "ParentHome")) {
    store.dispatch("spin/setMaskMain", true);
    canAccess = await ParentService.getGSConnectAccess();
    store.dispatch("spin/setMaskMain", false);
  }
  if (canAccess) {
    return true;
  }
  return { path: "/access-information" };
};
