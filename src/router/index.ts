import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useStore } from "vuex";
import Home from "../views/home/home.vue";
import { LayoutGuard } from "./guard";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      layout: "main",
    },
  },
  {
    path: "/class/:id",
    name: "Class",
    component: () => import("../views/class/class.vue"),
    meta: {
      layout: "full",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
