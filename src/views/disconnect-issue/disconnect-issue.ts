import { defineComponent, computed } from "vue";
import { DisconnectScreenLocale } from "@/locales/localeid";
import { fmtMsg } from "commonui";

export default defineComponent({
  setup() {
    const title = computed(() => fmtMsg(DisconnectScreenLocale.Title));
    const contentFirst = computed(() => fmtMsg(DisconnectScreenLocale.Content1));
    const contentSecond = computed(() => fmtMsg(DisconnectScreenLocale.Content2));
    const goTo = computed(() => fmtMsg(DisconnectScreenLocale.Goto));
    return { title, contentFirst, contentSecond, goTo };
  },
});
