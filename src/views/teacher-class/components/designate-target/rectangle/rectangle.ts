import { computed, defineComponent } from "vue";

export default defineComponent({
  props: ["id", "x", "y", "width", "height"],
  setup(props) {
    const style = computed(
      () =>
        `width: ${props.width}px; height:${props.height}px; left: 0; top: 0; transform: translate(${props.x}px,${props.y}px);`
    );
    return {
      style,
    };
  },
});
