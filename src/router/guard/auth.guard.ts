import {
  AuthService,
  GLUtil,
  locationReplace,
  LoginInfo,
  RoleName,
} from "@/commonui";
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

import { store } from "@/store";
import { AppView } from "@/store/app/state";

const isTokenExpired = () => {
  const { getTokenParam } = AuthService.getTokenUrlParams();
  const exp = getTokenParam("id_token").exp;
  return !GLUtil.isNullOrUndefined(exp) && new Date(exp * 1000) < new Date();
};

const verifySession = () => {
  if (isTokenExpired()) {
    console.log("token expired");
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
    if (!store.getters["spin/setSplash"]) {
      store.dispatch("spin/setSplash", true);
    }
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
        store.dispatch("setAppView", { appView: AppView.UnAuthorized });
        return;
      }
      if (store.getters.appView !== AppView.Authorized) {
        store.dispatch("setAppView", { appView: AppView.Authorized });
      }
      if (store.getters["spin/setSplash"]) {
        store.dispatch("spin/setSplash", false);
      }
      next();
    } else {
      store.dispatch("setAppView", { appView: AppView.UnAuthorized });
      next(false);
    }
  }
};

export default (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const requiresAuth: boolean = to.matched.some(
    (record) => record.meta.requiresAuth
  );

  const hasIdTokenInUrl = window.location.href.indexOf("id_token") !== -1;
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
    } else if (hasIdTokenInUrl) {
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
    store.dispatch("setAppView", { appView: AppView.NotFound });
    next();
  } else {
    store.dispatch("setAppView", { appView: AppView.Blank });
    next();
  }
  next();
};
