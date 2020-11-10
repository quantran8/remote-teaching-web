import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const popup = ref(false);
    const showPopup = () => {
      popup.value = true;
    };
    const hidePopup = () => {
      popup.value = false;
    };
    return { popup, showPopup, hidePopup };
  },
});
