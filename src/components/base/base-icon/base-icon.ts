import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    name: String,
  },
  setup(props) {
    const iconCssClass = computed(() => "rt-" + props.name);
    return { iconCssClass };
  },
});
