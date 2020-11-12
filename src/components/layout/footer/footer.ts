import { GLGlobal } from '@/commonui';
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const openPrivacyPolicy = () => {
      window.open(`${GLGlobal.authorityUrl()}/Copyright/PrivacyPolicy`);
    };
    return { openPrivacyPolicy };
  },
});
