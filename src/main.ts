import { createApp } from "vue";
import App from "./app/app.vue";
import "./registerServiceWorker";
import router from "./router";
import i18n from "./commonui/locales/i18n";
import {
  BaseButton,
  BaseCard,
  BaseIcon,
  BaseModal,
  BaseTag,
} from "./components/base";
import { LiveCircle, Toast, Notification, ContentView, DesignateCircle, DesignateRectangle, AnnotationView } from "./components/common";

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
app.component("Toast", Toast);
app.component("Notification", Notification);
app.component("ContentView", ContentView);
app.component("AnnotationView", AnnotationView);
app.component("DesignateCircle", DesignateCircle);
app.component("DesignateRectangle", DesignateRectangle);
//app.component("UnityView", UnityView);
app.use(router);
app.use(store);
app.use(i18n);
app.mount("#app");
