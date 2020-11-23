import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { AuthService, LoginInfo, RoleName } from "@/commonui";
import { RequireTeacherError } from "../error";

export default (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  _next: NavigationGuardNext
) => {
  const requireTeacher: boolean = to.matched.some(
    (record) => record.meta.requireTeacher
  );
  if (!requireTeacher) return;

  const loginInfo: LoginInfo = AuthService.getLoginInfo();
  if (!loginInfo || !loginInfo.profile) return;

  const isTeacher = loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1;
  if (!isTeacher) {
    throw new RequireTeacherError();
  }
};
