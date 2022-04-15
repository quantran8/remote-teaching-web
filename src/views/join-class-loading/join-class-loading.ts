import { JoinLoading } from "@/locales/localeid";
import { fmtMsg } from "vue-glcommonui";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const message = computed(() => fmtMsg(JoinLoading.Message));
    return { message };
  },
});
