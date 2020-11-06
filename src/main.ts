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
import { store } from "./store";

const app = createApp(App);
app.component("BaseIcon", BaseIcon);
app.component("BaseButton", BaseButton);
app.component("BaseCard", BaseCard);
app.component("BaseTag", BaseTag);
app.component("BaseModal", BaseModal);
app.use(router);
app.use(store);
app.mount("#app");
