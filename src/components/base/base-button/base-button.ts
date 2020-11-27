import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    mode: {
      type: String,
      default: "fill",
    },
    color: {
      type: String,
      default: "white",
    },
  },
  setup(props) {
    const cssClass = computed(
      () => `button-${props.mode} color-${props.color}`
    );
    return { cssClass };
  },
});
