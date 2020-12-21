import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const isFlipped = ref(false);
    const toggleView = () => {
      isFlipped.value = !isFlipped.value;
    };
    return { currentExposureItemMedia, isFlipped, toggleView };
  },
});
