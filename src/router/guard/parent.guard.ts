import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, LoginInfo, RoleName } from "@/commonui";
import { RequireParentError } from "../error";

export default (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  _next: NavigationGuardNext
) => {
  const requireParent: boolean = to.matched.some(
    (record) => record.meta.requireParent
  );
  if (!requireParent) return;
  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (loginInfo && loginInfo.profile) {
    const isParent = loginInfo.profile.roles.indexOf(RoleName.parent) !== -1;
    if (!isParent) {
      throw new RequireParentError();
    }
  }
};
