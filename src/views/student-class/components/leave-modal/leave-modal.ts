import { defineComponent } from "vue";

export default defineComponent({
  emits: ["dismiss", "leave"],
  setup(props, { emit }) {
    const onClickDismiss = () => {
      emit("dismiss");
    };
    const onClickLeave = () => {
      emit("leave");
    };
    return {
      onClickDismiss,
      onClickLeave,
    };
  },
});
