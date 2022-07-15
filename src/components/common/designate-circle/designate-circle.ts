import { computed, defineComponent } from "vue";

export default defineComponent({
  props: ["id", "x", "y", "radius", "zIndex"],
  setup(props) {
    const style = computed(
      () =>
        `width: ${props.radius * 2}px; height:${props.radius * 2}px; left:0; top: 0; transform: translate(${props.x - props.radius}px,${
          props.y - props.radius
        }px); z-index: ${props.zIndex ? props.zIndex : 0}`,
    );

    return {
      style,
    };
  },
});
