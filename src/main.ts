import AccessDeniedPage from "@/views/access-denied/access-denied.vue";
import DisconnectIssuePage from "@/views/disconnect-issue/disconnect-issue.vue";
import LoadingPage from "@/views/loading/loading.vue";
import { createApp } from "vue";
import VueCropper from "vue-cropperjs";
import { BaseButton, BaseCard, BaseIcon, BaseTag, GLPlugin, MatIcon, VueSite } from "vue-glcommonui";
import Lottie from "vue-lottie";
import App from "./app/app.vue";
import {
	AnnotationView,
	ContentView,
	CropImage,
	CustomSpinner,
	DesignateCircle,
	DesignateRectangle,
	DeviceTester,
	LiveCircle,
	Notification,
	PinningModal,
	Toast
} from "./components/common";
import router from "./router";
import i18n, { loadAsyncLocale, persistLocale } from "./utils/i18n";

import NotFoundPage from "@/views/not-found/not-found.vue";
import "cropperjs/dist/cropper.css";
import VueFinalModal from "vue-final-modal";
import { ClickOutsideDirective } from "./directives";
import { store } from "./store";
import "./style/main.less";
import { Paths } from "./utils/paths";

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
app.component("PinningModal", PinningModal);
app.component("CustomSpinner", CustomSpinner);
app.component("DesignateRectangle", DesignateRectangle);
app.component("Lottie", Lottie);
app.component("CropImage", CropImage);
app.component("VueCropper", VueCropper);
app.component("MatIcon", MatIcon);
app.use(store);
app.use(VueFinalModal());
//vue-glcommonui plugin
app.use(GLPlugin, {
  i18nInstance: i18n,
  store,
  appConfig: process.env,
  option: {
    persistLocale,
    loadAsyncLocale,
    vueSite: VueSite.GSConnect,
  },
});
app.use(router);

// Global properties
app.config.globalProperties.$paths = Paths;

app.mount("#app");
