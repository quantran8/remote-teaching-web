import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    mode: {
      type: String,
      default: "fill",
    },
  },
  setup(props) {
    const buttonMode = computed(() => `button-${props.mode}`);
    return { buttonMode };
  },
});
