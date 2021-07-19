import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, LoginInfo, RoleName } from "@/commonui";

export default (to: RouteLocationNormalized, _from: RouteLocationNormalized, _next: NavigationGuardNext) => {
  const requireTeacher: boolean = to.matched.some(record => record.meta.requireTeacher);
  if (!requireTeacher) return true;
  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (loginInfo && loginInfo.profile) {
    const isTeacher =
      loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1 &&
      loginInfo.profile.remoteTsiSettings &&
      loginInfo.profile.remoteTsiSettings.some(r => r.isAllowed);
    return isTeacher;
  } else {
    return false;
  }
};
