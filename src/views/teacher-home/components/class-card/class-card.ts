import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click-to-access"],
  setup(props, { emit }) {
    const btnText = computed(() => {
      return props.active ? "Join now" : "Start";
    });

    const clickToAccess = () => {
      emit("click-to-access");
    };

    return { btnText, clickToAccess };
  },
});
