import { defineComponent } from "vue";

export default defineComponent({
  emits: ["dismiss", "confirm"],
  props: {
    title: {
      type: String,
      default: "Oops",
    },
    message: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const onClickDismiss = () => {
      emit("dismiss");
    };
    const onClickConfirm = () => {
      emit("confirm");
    };
    return {
      onClickDismiss,
      onClickConfirm,
    };
  },
});
