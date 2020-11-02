import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const openPrivacyPolicy = () => {
      console.log("openPrivacyPolicy");
    };
    return { openPrivacyPolicy };
  },
});
