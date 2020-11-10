import {
  AuthService,
  GLUtil,
  locationReplace,
  LoginInfo,
  RoleName,
} from "@/commonui";
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  Router,
} from "vue-router";

import { store } from "@/store";

const isTokenExpired = () => {
  const { getTokenParam } = AuthService.getTokenUrlParams();
  const exp = getTokenParam("id_token").exp;
  return !GLUtil.isNullOrUndefined(exp) && new Date(exp * 1000) < new Date();
};

const verifySession = () => {
  if (isTokenExpired()) {
    const abortSignin = () => {
      locationReplace("/");
      return Promise.reject();
    };
    return AuthService.clearState()
      .then((_) => abortSignin())
      .catch((_) => abortSignin());
  }
  AuthService.trySetSigninVerifyToken();
  return Promise.resolve();
};

const routeAuth = (
  loginInfo: LoginInfo,
  to: RouteLocationNormalized,
  next: any
) => {
  if (
    !loginInfo.loggedin ||
    GLUtil.isExpired(loginInfo) ||
    !AuthService.hasPermissions(loginInfo)
  ) {
    // if (!spinModule.splash) {
    // 	spinModule.setSplash(true);
    // }
    store.dispatch("spin/setSplash", true);
    AuthService.storePagethenSigninRedirect();
  } else {
    if (to.meta) {
      const roles = loginInfo?.profile?.roles;
      const isSadminOrCAdmin =
        Array.isArray(roles) &&
        roles.some(
          (r) => r === RoleName.systemAdmin || r === RoleName.contentAdmin
        );
      if (!isSadminOrCAdmin) {
        //	appSetting.setAppMode(AppViewMode.UnAuthorized);
        return;
      }
      // if (appSetting.mode !== AppViewMode.Authorized) {
      // 	appSetting.setAppMode(AppViewMode.Authorized);
      // }

      store.dispatch("spin/setSplash", false);
      // if (spinModule.splash) {
      // 	spinModule.setSplash(false);
      // }

      // if (to.matched && to.matched.length > 0) {
      // 	appSetting.setAppMenu(to.matched[0]?.meta?.viewId);
      // 	appSetting.setMenuCategory(to.matched[0]?.meta?.menuId);
      // 	appSetting.setMangerVisible(last(to.matched)!.meta?.verManagerVisible);
      // }

      // const authInfo = getAutorizationDetails(to.meta, loginInfo.profile.permissions);
      // if (authInfo.isAuthorized && (isUndefined(authInfo.navigateTo) || isNull(authInfo.navigateTo))) {
      // 	appSetting.setChildMenu(to.meta?.viewId);
      // 	next();
      // } else if (authInfo.isAuthorized && !isUndefined(authInfo.navigateTo) && !isNull(authInfo.navigateTo)) {
      // 	to.path === authInfo.navigateTo ? next() : next({ path: authInfo.navigateTo, replace: true });
      // } else {
      // 	appSetting.setAppMode(AppViewMode.UnAuthorized);
      // 	next(false);
      // }
    } else {
      // appSetting.setAppMode(AppViewMode.UnAuthorized);
      next(false);
    }
  }
};

export default (
  router: Router,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const requiresAuth: boolean = to.matched.some(
    (record) => record.meta.requiresAuth
  );
  if (requiresAuth) {
    const isSigningOut = window.location.href.indexOf("oidc/signout") !== -1;
    if (isSigningOut) {
      const onSignedOut = (res: any) => {
        AuthService.clearSignStorage();
        const page = AuthService.getPageAfterSignout();
        locationReplace(page ? page.afterSignout || page.currentSignout : "/");
      };
      AuthService.signoutRedirectCallback()
        .then(onSignedOut)
        .catch((e) => {
          console.error(e);
        });
    } else if (window.location.href.indexOf("id_token") !== -1) {
      verifySession().then(() => {
        AuthService.signinRedirectCallback().then((user) => {
          try {
            const page = AuthService.getPageAfterSignin();
            const processedUser = AuthService.processUser(user);
            AuthService.setLoginInfo(true, processedUser, () => {
              const replaceToSite = () =>
                locationReplace(
                  page ? page.afterSignin || page.shouldSignin : "/"
                );
              try {
                return replaceToSite();
              } catch (e) {
                return replaceToSite();
              }
            });
          } catch (e) {
            locationReplace("/");
          }
        });
      });
    } else {
      const loginInfo = AuthService.getLoginInfo();
      if (loginInfo && loginInfo.loggedin) {
        routeAuth(loginInfo, to, next);
      } else {
        AuthService.useLocalStoreToLogin().then((loginInfo) =>
          routeAuth(loginInfo, to, next)
        );
      }
    }
  } else if (to.matched.some((record) => record.meta.notFound)) {
    // appSetting.setAppMode(AppViewMode.NotFound);
    next();
  } else {
    // appSetting.setAppMode(AppViewMode.Blank);
    next();
  }
  next();
};
