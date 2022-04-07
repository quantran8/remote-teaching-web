import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { store } from "@/store";

export default (to: RouteLocationNormalized, _from: RouteLocationNormalized, _next: NavigationGuardNext) => {
  if (to.meta) {
    store.dispatch("setLayout", {
      layout: to.meta.layout,
    });
  }
};
