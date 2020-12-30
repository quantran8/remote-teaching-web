import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: ['id', "x", "y", "width", "height"],
  setup(props) {
    const style = ref("");
    const updateStyle = () => {
      style.value = `width: ${props.width}px; height:${props.height}px; left: ${props.x}px; top: ${props.y}px`;
    };
    updateStyle();
    watch(props, updateStyle);
    return {
      style,
    };
  },
});
