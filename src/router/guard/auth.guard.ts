import {
  NavigationGuardNext,
  RouteLocationNormalized,
  Router,
} from "vue-router";
import { Store } from "vuex";
export default (
  store: Store<any>,
  router: Router,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.meta) {
    store.dispatch("setLayout", to.meta.layout);
  }
  next();
};
