import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, RoleName, LoginInfo } from "vue-glcommonui";
export default (to: RouteLocationNormalized, _from: RouteLocationNormalized, _next: NavigationGuardNext) => {
  const requireTeacher: boolean = to.matched.some(record => record.meta.requireTeacher);
  if (!requireTeacher) return true;
  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (loginInfo && loginInfo.profile) {
    const isTeacher = loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1 && loginInfo.profile.remoteTsiSettings;
    return isTeacher;
  } else {
    return false;
  }
};
