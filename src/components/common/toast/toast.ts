import { computed, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { getters, dispatch } = useStore();
    const toast = computed(() => getters["appToast"]);
    const cssClass = ref("snackbar");
    const timeoutId: Ref<NodeJS.Timeout | null> = ref(null);
    watch(toast, () => {
      cssClass.value = "snackbar";
      if (timeoutId.value) clearTimeout(timeoutId.value);
      if (toast.value) {
        setTimeout(() => {
          cssClass.value = toast.value ? "snackbar show" : "snackbar";
        }, 100);
        timeoutId.value = setTimeout(() => {
          if (toast.value) dispatch("setToast", "");
        }, 2500);
      }
    });
    return { toast, cssClass };
  },
});
