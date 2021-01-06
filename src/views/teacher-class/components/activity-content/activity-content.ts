import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const designateTargets = computed(
      () => store.getters["interactive/targets"]
    );
    const currentExposureItemMedia = computed(
      () => store.getters["lesson/currentExposureItemMedia"]
    );
    const isDesignatingTarget = computed(
      () => store.getters["teacherRoom/isDesignatingTarget"]
    );
    const isFlipped = computed(() => store.getters["lesson/isBlackOut"]);
    const toggleView = async () => {
      await store.dispatch("teacherRoom/setBlackOut", {
        isBlackOut: !isFlipped.value,
      });
    };
    const contentImageStyle = computed(() => {
      return currentExposureItemMedia.value
        ? {
            "background-image": `url("${currentExposureItemMedia.value.image.url}")`,
          }
        : {};
    });
    const onClickToggleDesignatingTarget = () => {
      store.dispatch("interactive/setDesignatingTarget", {
        isDesignatingTarget: !isDesignatingTarget.value,
      });
    };

    return {
      currentExposureItemMedia,
      designateTargets,
      isFlipped,
      toggleView,
      contentImageStyle,
      onClickToggleDesignatingTarget,
      isDesignatingTarget,
    };
  },
});
