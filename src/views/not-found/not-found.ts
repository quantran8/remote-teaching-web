import { NotFoundLocale } from "@/locales/localeid";
import { fmtMsg } from "vue-glcommonui";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const pageNotFoundText = computed(() => fmtMsg(NotFoundLocale.PageNotFound));
    const descriptionText = computed(() => fmtMsg(NotFoundLocale.Description));
    const goToPageText = computed(() => fmtMsg(NotFoundLocale.GoToPage));
    return {
      pageNotFoundText,
      descriptionText,
      goToPageText,
    };
  },
});
