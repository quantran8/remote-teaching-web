import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { fmtMsg } from "@/commonui";
import { LostNetwork } from "@/locales/localeid";

type LayoutType = "" | "full" | "main";

export default defineComponent({
  props: ["type"],
  setup(props) {
    const messageText = computed(() => fmtMsg(LostNetwork.Message));
    const { getters } = useStore();
    const studentDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnected"]);
    const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
    const isTeacher = computed(() => getters["auth/isTeacher"]);
    const isDisconnectedMode = computed<any>(() => studentDisconnected.value || teacherDisconnected.value);
    return { messageText, isDisconnectedMode, isTeacher };
  },
});
