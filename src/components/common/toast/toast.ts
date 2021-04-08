import { computed, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { getters, dispatch } = useStore();
    const toast = computed(() => getters["appToast"]);
    const cssClass = ref("snackbar");
    const timeoutId: Ref<NodeJS.Timeout | null> = ref(null);
    const audio = new Audio(require('../../../assets/audio/unlock_material.mp3'));
    watch(toast, () => {
      cssClass.value = "snackbar";
      if (timeoutId.value) clearTimeout(timeoutId.value);
      if (toast.value && toast.value.message) {
        setTimeout(() => {
          console.log(toast.value);
          if (toast.value.isPlaySound)
            audio.play();
          cssClass.value = toast.value.message ? "snackbar show" : "snackbar";
        }, 100);
        timeoutId.value = setTimeout(() => {
          if (toast.value) dispatch("setToast", {message:""});
        }, 2500);
      }
    });
    return { toast, cssClass };
  },
});
