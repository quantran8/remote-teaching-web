import { AccessDeniedLocale } from "./../../locales/localeid";
import { fmtMsg } from "@/commonui";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const accessDeniedWeAreSorry = computed(() => fmtMsg(AccessDeniedLocale.AccessDeniedWeAreSorry));
    const accessDeniedDescription = computed(() => fmtMsg(AccessDeniedLocale.AccessDeniedDescription));
    const accessDeniedSuggest = computed(() => fmtMsg(AccessDeniedLocale.AccessDeniedSuggest));
    return {
      accessDeniedWeAreSorry,
      accessDeniedDescription,
      accessDeniedSuggest,
    };
  },
});
