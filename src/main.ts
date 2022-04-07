import { createApp } from "vue";
import Lottie from "vue-lottie";
import VueCropper from "vue-cropperjs";
import App from "./app/app.vue";
import i18n from "./utils/i18n";
import "./registerServiceWorker";
import router from "./router";
import { GLPlugin } from "vue-glcommonui";
import { BaseButton, BaseCard, BaseIcon, BaseTag, MatIcon } from "vue-glcommonui";
import {
  LiveCircle,
  Toast,
  Notification,
  ContentView,
  DesignateCircle,
  DesignateRectangle,
  AnnotationView,
  DeviceTester,
  CropImage,
} from "./components/common";
import LoadingPage from "@/views/loading/loading.vue";
import AccessDeniedPage from "@/views/access-denied/access-denied.vue";
import DisconnectIssuePage from "@/views/disconnect-issue/disconnect-issue.vue";

import NotFoundPage from "@/views/not-found/not-found.vue";

import { store } from "./store";
import { ClickOutsideDirective } from "./directives";
import { Paths } from "./utils/paths";
import "./style/main.less";
import "cropperjs/dist/cropper.css";

const app = createApp(App);
app.directive("click-outside", ClickOutsideDirective);
app.component("LoadingPage", LoadingPage);
app.component("AccessDeniedPage", AccessDeniedPage);
app.component("DisconnectIssuePage", DisconnectIssuePage);
app.component("NotFoundPage", NotFoundPage);
app.component("BaseIcon", BaseIcon);
app.component("BaseButton", BaseButton);
app.component("BaseCard", BaseCard);
app.component("BaseTag", BaseTag);
app.component("LiveCircle", LiveCircle);
app.component("Toast", Toast);
app.component("Notification", Notification);
app.component("ContentView", ContentView);
app.component("AnnotationView", AnnotationView);
app.component("DesignateCircle", DesignateCircle);
app.component("DeviceTester", DeviceTester);
app.component("DesignateRectangle", DesignateRectangle);
app.component("Lottie", Lottie);
app.component("CropImage", CropImage);
app.component("VueCropper", VueCropper);
app.component("MatIcon", MatIcon);
app.use(router);
app.use(store);

//vue-glcommonui plugin
app.use(GLPlugin, {
  i18nInstance: i18n,
  store,
});

// Global properties
app.config.globalProperties.$paths = Paths;

app.mount("#app");
