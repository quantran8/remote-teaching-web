import { createApp } from "vue";
import App from "./app/app.vue";
import "./registerServiceWorker";
import router from "./router";
import {
  BaseButton,
  BaseCard,
  BaseIcon,
  BaseModal,
  BaseTag,
} from "./components/base";
import { LiveCircle } from "./components/common";

import LoadingPage from "@/views/loading/loading.vue";
import AccessDeniedPage from "@/views/access-denied/access-denied.vue";
import NotFoundPage from "@/views/not-found/not-found.vue";

import { store } from "./store";
import { ClickOutsideDirective } from "./directives";

const app = createApp(App);
app.directive("click-outside", ClickOutsideDirective);
app.component("LoadingPage", LoadingPage);
app.component("AccessDeniedPage", AccessDeniedPage);
app.component("NotFoundPage", NotFoundPage);
app.component("BaseIcon", BaseIcon);
app.component("BaseButton", BaseButton);
app.component("BaseCard", BaseCard);
app.component("BaseTag", BaseTag);
app.component("BaseModal", BaseModal);
app.component("LiveCircle", LiveCircle);
app.use(router);
app.use(store);
app.mount("#app");
