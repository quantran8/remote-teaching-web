import { defineComponent } from "vue";

export default defineComponent({
  emits: ["on-close"],
  setup(props, { emit }) {
    const onClickDismiss = () => {
      emit("on-close");
    };
    return { onClickDismiss };
  },
});
