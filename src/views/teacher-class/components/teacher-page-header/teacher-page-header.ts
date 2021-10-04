import { fmtMsg, MatIcon } from "@/commonui";
import { computed, defineComponent, ref } from "vue";
import { ClassAction, ClassActionToValue } from "@/store/room/student/state";
import { useStore } from "vuex";
import { CommonLocale } from "@/locales/localeid";
export default defineComponent({
  props: {
    teacherName: String,
    className: String,
  },
  emits: ["end"],
  components: {
    MatIcon,
  },
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const actions = [
      { id: ClassAction.DEFAULT, icon: "default" },
      { id: ClassAction.INTERACTIVE, icon: "interactive" },
      { id: ClassAction.LISTEN, icon: "listen" },
      { id: ClassAction.QUESTION, icon: "question" },
      { id: ClassAction.QUIET, icon: "quiet" },
      { id: ClassAction.SING, icon: "sing" },
      { id: ClassAction.SPEAK, icon: "speak" },
    ];
    const classAction = computed(() => {
      const id: ClassAction = getters["teacherRoom/classAction"];
      return actions.find(e => e.id === id) || actions[0];
    });
    const classActionsTitle = computed(() => fmtMsg(CommonLocale.CommonClassActions));

    const onClickSelectAction = async (action: { id: ClassAction; icon: string }) => {
      await dispatch("teacherRoom/setClassAction", {
        action: ClassActionToValue(action.id),
      });
    };

    const onClickEnd = () => {
      emit("end");
    };

    return {
      actions,
      classAction,
      onClickEnd,
      onClickSelectAction,
      ClassAction,
      classActionsTitle,
    };
  },
});
