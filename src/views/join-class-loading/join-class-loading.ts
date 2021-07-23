import { JoinLoading } from "@/locales/localeid";
import { fmtMsg } from "@/commonui";
import { computed, defineComponent } from "vue";

export default defineComponent({
  setup() {
    const message = computed(() => fmtMsg(JoinLoading.Message));
    return { message };
  },
});
