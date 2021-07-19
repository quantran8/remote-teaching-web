import { MatIcon } from "@/commonui";
import { computed, defineComponent, ref } from "vue";
import { ClassAction, ClassActionToValue } from "@/store/room/student/state";
import { useStore } from "vuex";
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
      { id: ClassAction.INTERACTIVE, icon: "interactive" },
      { id: ClassAction.LISTEN, icon: "listen" },
      { id: ClassAction.QUESTION, icon: "question" },
      { id: ClassAction.QUIET, icon: "quiet" },
      { id: ClassAction.SING, icon: "sing" },
      { id: ClassAction.SPEAK, icon: "speak" },
    ];
    const classAction = computed(() => {
      const id: ClassAction = getters["teacherRoom/classAction"];
      return actions.find(e => e.id === id) || actions[2];
    });

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
    };
  },
});
