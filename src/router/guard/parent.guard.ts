import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, LoginInfo, RoleName } from "@/commonui";

export default (to: RouteLocationNormalized, _from: RouteLocationNormalized, _next: NavigationGuardNext) => {
  const requireParent: boolean = to.matched.some(record => record.meta.requireParent);
  if (!requireParent) return true;
  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (loginInfo && loginInfo.profile) {
    const isParent = loginInfo.profile.roles.indexOf(RoleName.parent) !== -1;
    return isParent;
  }
  else
  {
	  return false;
  }
};
