import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const isFlipped = computed(() => store.getters["lesson/isBlackOut"]);
    const toggleView = async () => {
      await store.dispatch("teacherRoom/setBlackOut", {
        isBlackOut: !isFlipped.value,
      });
    };
    const contentImageStyle = computed(() => {
      return {
        "background-image": `url("${currentExposureItemMedia.value.image.url}")`,
      };
    });
    return {
      currentExposureItemMedia,
      isFlipped,
      toggleView,
      contentImageStyle,
    };
  },
});
