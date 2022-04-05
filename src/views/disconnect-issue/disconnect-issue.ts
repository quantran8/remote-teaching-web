import { defineComponent, computed, onMounted } from "vue";
import { DisconnectScreenLocale } from "@/locales/localeid";
import * as audioSource from "@/utils/audioGenerator";
import { fmtMsg } from "vue-glcommonui";

export default defineComponent({
  setup() {
    onMounted(() => {
      audioSource.canGoToClassRoomToday.play();
    });
    const title = computed(() => fmtMsg(DisconnectScreenLocale.Title));
    const contentFirst = computed(() => fmtMsg(DisconnectScreenLocale.Content1));
    const contentSecond = computed(() => fmtMsg(DisconnectScreenLocale.Content2));
    const goTo = computed(() => fmtMsg(DisconnectScreenLocale.Goto));
    return { title, contentFirst, contentSecond, goTo };
  },
});
