import { computed, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { Howl, Howler } from "howler";

export default defineComponent({
  setup() {
    const { getters, dispatch } = useStore();
    const toast = computed(() => getters["appToast"]);
    const cssClass = ref("snackbar");
    const timeoutId: Ref<NodeJS.Timeout | null> = ref(null);
    const sound = new Howl({
      src: [require(`@/assets/audio/unlock_material.mp3`)],
    });
    Howler.volume(1);
    watch(toast, () => {
      cssClass.value = "snackbar";
      if (timeoutId.value) {
        clearTimeout(timeoutId.value);
      }
      const hasMessage = !!(toast.value.message || toast.value.bigIcon);
      if (toast.value && hasMessage) {
        setTimeout(async () => {
          if (toast.value.isPlayingSound) {
            await sound.play();
          }
          cssClass.value = hasMessage ? "snackbar show" : "snackbar";
        }, 100);

        timeoutId.value = setTimeout(async () => {
          if (toast.value) {
            await dispatch("setToast", { message: "" });
          }
        }, 2500);
      }
    });
    return { toast, cssClass };
  },
});
