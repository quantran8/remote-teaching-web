import { Layout } from "@/locales/localeid";
import { fmtMsg, GLGlobal } from "@/commonui";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const openPrivacyPolicy = () => {
      window.open(`${GLGlobal.authorityUrl()}/Copyright/PrivacyPolicy`);
    };
    const privacyText = computed(() => fmtMsg(Layout.PrivacyPolicy));
    return { openPrivacyPolicy, privacyText };
  },
});
