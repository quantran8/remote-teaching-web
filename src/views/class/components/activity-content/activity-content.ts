import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const isFlipped = ref(false);
    const toggleView = () => {
      isFlipped.value = !isFlipped.value;
    };
    return { isFlipped, toggleView };
  },
});
