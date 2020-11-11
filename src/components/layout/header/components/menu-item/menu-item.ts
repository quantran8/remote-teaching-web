import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    expandable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const popup = ref(false);

    const togglePopup = () => {
      popup.value = !popup.value;
    };
    const showPopup = () => {
      popup.value = true;
    };
    const hidePopup = () => {
      popup.value = false;
    };
    return { ...props, popup, showPopup, hidePopup, togglePopup };
  },
});
