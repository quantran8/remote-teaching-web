import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits:['on-click-content-view'],
  setup(props, {emit}) {
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
    const localTargets: Array<string> = [];
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

    const onClickContentView = async (payload: {
      x: number, y: number, contentId: string})=>{
        emit('on-click-content-view', payload);
    }


    return {
      currentExposureItemMedia,
      designateTargets,
      isFlipped,
      toggleView,
      contentImageStyle,
      onClickToggleDesignatingTarget,
      isDesignatingTarget,
      localTargets,
      onClickContentView
    };
  },
});
