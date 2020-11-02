import { createApp } from "vue";
import App from "./app/app.vue";
import "./registerServiceWorker";
import store from "./store";
import router from "./router";
import { BaseCard, BaseIcon, BaseIconButton, BaseTag } from "./components/base";
import { LayoutGuard } from "./router/guard";

const app = createApp(App);
app.component("BaseIcon", BaseIcon);
app.component("BaseIconButton", BaseIconButton);
app.component("BaseCard", BaseCard);
app.component("BaseTag", BaseTag);
app.use(router);
app.use(store);
app.mount("#app");

router.beforeEach((from, to, next) => {
  LayoutGuard(store, router, from, to, next);
});
