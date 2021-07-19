import { defineComponent } from "vue";

export default defineComponent({
  emits: ["close"],
  setup(props, { emit }) {
    const onClickDismiss = () => {
      emit("close");
    };
    return { onClickDismiss };
  },
});
