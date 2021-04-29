import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["hide-all", "show-all", "mute-all", "unmute-all", "add-sticker-all", "disable-all"],

  setup(props, { emit }) {
    const { getters, dispatch } = useStore();

    const isAllVideoHidden = computed(() => getters["teacherRoom/isAllVideoHidden"]);
    const isAllAudioMuted = computed(() => getters["teacherRoom/isAllAudioMuted"]);

    const onClickToggleVideo = () => {
      emit(isAllVideoHidden.value ? "show-all" : "hide-all");
    };

    const onClickToggleAudio = () => {
      emit(isAllAudioMuted.value ? "unmute-all" : "mute-all");
    };

    const onClickStickerAll = () => {
      emit("add-sticker-all");
    };

    const onClickDisableAll = async () => {
      emit("disable-all");
    };

    return {
      onClickDisableAll,
      onClickStickerAll,
      onClickToggleVideo,
      onClickToggleAudio,
      isAllVideoHidden,
      isAllAudioMuted,
    };
  },
});
