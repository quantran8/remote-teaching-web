import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";
import Home from "../views/home/home.vue";
import Teacher from "../views/teacher/teacher.vue";
import Student from "../views/student/student.vue";
import { store } from "@/store";
import {
  AuthService,
  GLUtil,
  locationReplace,
  LoginInfo,
  RoleName,
} from "@/commonui";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      layout: "main",
      requiresAuth: true,
    },
  },
  {
    path: "/teacher",
    name: "teacher",
    component: Teacher,
    meta: {
      layout: "main",
      requiresAuth: true,
    },
  },
  {
    path: "/student",
    name: "Student",
    component: Student,
    meta: {
      layout: "main",
      requiresAuth: true,
    },
  },
  {
    path: "/class/:id",
    name: "Class",
    component: () => import("../views/class/class.vue"),
    meta: {
      layout: "full",
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const verifySession = () => {
  function isTokenExpired() {
    const { getTokenParam } = AuthService.getTokenUrlParams();
    const exp = getTokenParam("id_token").exp;
    return !GLUtil.isNullOrUndefined(exp) && new Date(exp * 1000) < new Date();
  }
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

router.beforeEach((to, from, next) => {
  const requiresAuth: boolean = to.matched.some(
    (record) => record.meta.requiresAuth
  );
  // if (requiresAuth) {
  //   if (window.location.href.indexOf("oidc/signout") !== -1) {
  //     AuthService.signoutRedirectCallback()
  //       .then((err) => {
  //         AuthService.clearSignStorage();
  //         const page = AuthService.getPageAfterSignout();
  //         locationReplace(
  //           page ? page.afterSignout || page.currentSignout : "/"
  //         );
  //       })
  //       .catch((e) => {
  //         console.error(e);
  //       });
  //   } else if (window.location.href.indexOf("id_token") !== -1) {
  //     verifySession().then(() => {
  //       AuthService.signinRedirectCallback().then((user) => {
  //         try {
  //           const page = AuthService.getPageAfterSignin();
  //           const processedUser = AuthService.processUser(user);
  //           AuthService.setLoginInfo(true, processedUser, () => {
  //             const replaceToSite = () =>
  //               locationReplace(
  //                 page ? page.afterSignin || page.shouldSignin : "/"
  //               );
  //             try {
  //               return replaceToSite();
  //             } catch (e) {
  //               return replaceToSite();
  //             }
  //           });
  //         } catch (e) {
  //           locationReplace("/");
  //         }
  //       });
  //     });
  //   } else {
  //     const loginInfo = AuthService.getLoginInfo();
  //     if (loginInfo && loginInfo.loggedin) {
  //       routeAuth(loginInfo, to, next);
  //     } else {
  //       AuthService.useLocalStoreToLogin().then((loginInfo) =>
  //         routeAuth(loginInfo, to, next)
  //       );
  //     }
  //   }
  // } else if (to.matched.some((record) => record.meta.notFound)) {
  //   // appSetting.setAppMode(AppViewMode.NotFound);
  //   next();
  // } else {
  //   // appSetting.setAppMode(AppViewMode.Blank);
  //   next();
  // }

  if (to.meta) {
    store.dispatch("setLayout", to.meta.layout);
  }
  next();
});

export default router;
