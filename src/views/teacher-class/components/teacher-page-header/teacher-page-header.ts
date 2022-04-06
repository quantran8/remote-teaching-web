import { fmtMsg } from "vue-glcommonui";
import { computed, defineComponent, onMounted, onUnmounted } from "vue";
import { ClassAction, ClassActionToValue } from "@/store/room/student/state";
import { useStore } from "vuex";
import { CommonLocale } from "@/locales/localeid";
export default defineComponent({
  props: {
    teacherName: String,
    className: String,
  },
  emits: ["end"],
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

    const selectAction = async (ev: KeyboardEvent) => {
      if (ev.altKey && ev.code == "Digit0") {
        ev.preventDefault();
        await onClickSelectAction(actions[0]);
      } else if (ev.altKey && ev.code == "Digit1") {
        ev.preventDefault();
        await onClickSelectAction(actions[2]);
      } else if (ev.altKey && ev.code == "Digit2") {
        ev.preventDefault();
        await onClickSelectAction(actions[1]);
      } else if (ev.altKey && ev.code == "Digit3") {
        ev.preventDefault();
        await onClickSelectAction(actions[6]);
      } else if (ev.altKey && ev.code == "Digit4") {
        ev.preventDefault();
        await onClickSelectAction(actions[4]);
      } else if (ev.altKey && ev.code == "Digit5") {
        ev.preventDefault();
        await onClickSelectAction(actions[3]);
      } else if (ev.altKey && ev.code == "Digit6") {
        ev.preventDefault();
        await onClickSelectAction(actions[5]);
      }
    };

    onMounted(async () => {
      window.addEventListener("keydown", selectAction);
    });

    onUnmounted(async () => {
      window.removeEventListener("keydown", selectAction);
    });

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
