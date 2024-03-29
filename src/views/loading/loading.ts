import { fmtMsg } from "vue-glcommonui";
import { LoadingLocale } from "@/locales/localeid";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const titleLoadingText = computed(() => fmtMsg(LoadingLocale.Title));
    return {
      titleLoadingText,
    };
  },
});
