import { computed, defineComponent, ref } from "vue";
import { ClassAction, ClassActionToValue } from "@/store/room/student/state";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    teacherName: String,
    className: String
  },
  emits: ["end"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const ctaVisible = ref(false);
    const actions = [
      { id: ClassAction.DEFAULT, icon: "none" },
      { id: ClassAction.INTERACTIVE, icon: "interactive" },
      { id: ClassAction.LISTEN, icon: "listen" },
      { id: ClassAction.QUESTION, icon: "question" },
      { id: ClassAction.QUIET, icon: "quiet" },
      { id: ClassAction.SING, icon: "sing" },
      { id: ClassAction.SPEAK, icon: "speak" },
    ];
    const classAction = computed(() => {
      const id: ClassAction = getters["teacherRoom/classAction"];
      return actions.find((e) => e.id === id) || actions[0];
    });

    const onClickSelectAction = async (action: {
      id: ClassAction;
      icon: string;
    }) => {
      // classAction.value = action;
      await dispatch("teacherRoom/setClassAction", {
        action: ClassActionToValue(action.id),
      });
      ctaVisible.value = false;
    };

    const onHoverCTAButton = () => {
      ctaVisible.value = true;
    };
    const onClickToggleCTAContent = () => {
      ctaVisible.value = !ctaVisible.value;
    };
    const onClickOutSideCTAContent = () => {
      ctaVisible.value = false;
    };

    const onClickEnd = () => {
      emit("end");
    };

    return {
      actions,
      classAction,
      onClickEnd,
      onHoverCTAButton,
      ctaVisible,
      onClickOutSideCTAContent,
      onClickSelectAction,
      ClassAction
    };
  }
});
