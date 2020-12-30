import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: ["id", "x", "y", "radius"],
  setup(props) {
    const style = ref("");
    const updateStyle = () => {
      style.value = `width: ${props.radius * 2}px; height:${props.radius *
        2}px; left: ${props.x - props.radius}px; top: ${props.y -
        props.radius}px`;
    };
    updateStyle();
    watch(props, updateStyle);
    return {
      style,
    };
  },
});
