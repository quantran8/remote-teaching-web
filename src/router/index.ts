import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home/home.vue";
import { LayoutGuard, AuthGuard } from "./guard";

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
    },
  },
  {
    path: "/student",
    name: "Student",
    component: () => import("../views/student/student.vue"),
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

router.beforeEach((to, from, next) => {
  try {
    AuthGuard(to, from, next);
    LayoutGuard(to, from, next);
    next();
  } catch (error) {
    console.log("Error", error);
  }
});

export default router;
