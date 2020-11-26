import { store } from "@/store";
import { AppView } from "@/store/app/state";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home/home.vue";
import { RequireTeacherError } from "./error";
import { LayoutGuard, AuthGuard, TeacherGuard, ParentGuard } from "./guard";

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
    name: "teacher",
    component: () => import("../views/teacher/teacher.vue"),
    meta: {
      layout: "main",
      requiresAuth: true,
      requireTeacher: true,
    },
  },
  {
    path: "/student",
    name: "Student",
    component: () => import("../views/student/student.vue"),
    meta: {
      layout: "main",
      requiresAuth: true,
      requireParent: true,
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
  {
    path: "/student-view/:id",
    name: "StudentView",
    component: () => import("../views/student-view/student-view.vue"),
    meta: {
      layout: "main",
      requiresAuth: true,
    },
  },

  {
    path: "/student/:studentId/class/:classId",
    name: "StudentClass",
    component: () => import("../views/student-class/student-class.vue"),
    meta: {
      layout: "main",
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
    console.log("RouterError", error);
    if (error as RequireTeacherError) {
      next();
      store.dispatch("setAppView", { appView: AppView.UnAuthorized });
    }
  }
});

export default router;
