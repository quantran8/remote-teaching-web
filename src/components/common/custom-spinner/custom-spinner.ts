import { defineComponent } from "vue";

export default defineComponent({
  props: {
    background: {
      type: String,
      default: "#fff",
    },
  },
  setup(props, { emit }) {
    return {};
  },
});
