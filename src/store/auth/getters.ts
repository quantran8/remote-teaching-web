import { RoleName, LoginInfo } from "vue-glcommonui";
import { GetterTree } from "vuex";
import { AuthState } from "./state";

const getters: GetterTree<AuthState, any> = {
  isLoggedIn: (state: AuthState): boolean => {
    return state.loginInfo?.loggedin || false;
  },
  isOnlyParent: (state: AuthState): boolean => {
    if (!state.loginInfo || !state.loginInfo.loggedin) return false;
    return state.loginInfo.profile.roles.indexOf(RoleName.parent) !== -1 && state.loginInfo.profile.roles.indexOf(RoleName.teacher) === -1;
  },
  isOnlyTeacher: (state: AuthState): boolean => {
    if (!state.loginInfo || !state.loginInfo.loggedin) return false;
    return state.loginInfo.profile.roles.indexOf(RoleName.parent) === -1 && state.loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1;
  },
  isParentAndTeacher: (state: AuthState): boolean => {
    if (!state.loginInfo || !state.loginInfo.loggedin) return false;
    return state.loginInfo.profile.roles.indexOf(RoleName.parent) !== -1 && state.loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1;
  },
  loginInfo: (state: AuthState): LoginInfo => {
    return state.loginInfo || ({} as LoginInfo);
  },
  username: (state: AuthState): string => {
    return state.loginInfo?.profile.name || "";
  },
  userAvatar: (state: AuthState): string => {
    return state.loginInfo?.profile.avatarUrl || "/assets/images/user-default.png";
  },
  userRole: (state: AuthState): string => {
    const rolesOrdering = [
      RoleName.systemAdmin,
      RoleName.globalHead,
      RoleName.trainingAdmin,
      RoleName.regionAdmin,
      RoleName.trainingManager,
      RoleName.trainer,
      RoleName.contentAdmin,
      RoleName.accountManager,
      RoleName.schoolAdmin,
      RoleName.campusAdmin,
      RoleName.teacher,
      RoleName.parent,
      RoleName.contentAdmin,
    ];
    let highestRole = state.loginInfo?.profile.roles[0] || "";
    for (const role of rolesOrdering) {
      if (state.loginInfo?.profile.roles.findIndex(r => r === role) !== -1) {
        highestRole = role;
        break;
      }
    }
    return highestRole;
  },
  isTeacher: (state: AuthState): boolean => {
    const roles = state.loginInfo?.profile.roles;
    return roles?.includes(RoleName.teacher) || false;
  },
  isParent: (state: AuthState): boolean => {
    const roles = state.loginInfo?.profile.roles;
    return roles?.includes(RoleName.parent) || false;
  },
};

export default getters;
