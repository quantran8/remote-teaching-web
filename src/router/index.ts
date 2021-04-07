import { store } from "@/store";
import { AppView } from "@/store/app/state";
import { Paths } from "@/utils/paths";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home/home.vue";
import { RequireParentError, RequireTeacherError } from "./error";
import { LayoutGuard, AuthGuard, TeacherGuard, ParentGuard } from "./guard";

const routes: Array<RouteRecordRaw> = [
  {
    path: Paths.Home,
    name: "Home",
    component: Home,
    meta: {
      layout: "main",
      requiresAuth: true,
    },
  },
  {
    path: "/access-denied",
    name: "access-denied",
    component: () => import("../views/access-denied/access-denied.vue"),
    meta: {
      layout: "main",
      requiresAuth: false,
    },
  },
  {
    path: "/teacher",
    name: "TeacherHome",
    component: () => import("../views/teacher-home/teacher-home.vue"),
    meta: {
      layout: "main",
      requiresAuth: true,
      requireTeacher: true,
    },
  },
  {
    path: "/class/:classId",
    name: "TeacherClass",
    component: () => import("../views/teacher-class/teacher-class.vue"),
    meta: {
      layout: "full",
      requiresAuth: true,
    },
  },
  {
    path: Paths.Parent,
    name: "ParentHome",
    component: () => import("../views/parent-home/parent-home.vue"),
    meta: {
      layout: "main",
      requiresAuth: true,
      requireParent: true,
    },
  },
  {
    path: "/student/:studentId/class/:classId",
    name: "StudentClass",
    component: () => import("../views/student-class/student-class.vue"),
    meta: {
      layout: "full",
      requiresAuth: true,
    },
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("../views/not-found/not-found.vue"),
    meta: {
      layout: "full",
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  try {
    AuthGuard(to, from, next);
    TeacherGuard(to, from, next);
    ParentGuard(to, from, next);
    LayoutGuard(to, from, next);
    next();
  } catch (error) {
    if (error as RequireTeacherError) {
      next();
      store.dispatch("setAppView", { appView: AppView.UnAuthorized });
    } else if (error as RequireParentError) {
      next();
      store.dispatch("setAppView", { appView: AppView.UnAuthorized });
    }
  }
});

export default router;
