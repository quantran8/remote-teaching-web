import { fmtMsg } from "vue-glcommonui";
import { TeacherClassGallery } from "@/locales/localeid";
import { computed, defineComponent, inject } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  emits: ["hide-all", "show-all", "mute-all", "unmute-all", "add-sticker-all", "disable-all", "enable-all"],

  setup(props, { emit }) {
    const { getters } = useStore();

    const isAllVideoHidden = computed(() => getters["teacherRoom/isAllVideoHidden"]);
    const isAllAudioMuted = computed(() => getters["teacherRoom/isAllAudioMuted"]);
    const isAllPaletteHidden = computed(() => getters["teacherRoom/isAllPaletteHidden"]);

    const stickerAllText = computed(() => fmtMsg(TeacherClassGallery.StickerAll));
    const unmuteAllText = computed(() => fmtMsg(TeacherClassGallery.UnmuteAll));
    const muteAllText = computed(() => fmtMsg(TeacherClassGallery.MuteAll));
    const enableAllText = computed(() => fmtMsg(TeacherClassGallery.EnableAll));
    const disableAllText = computed(() => fmtMsg(TeacherClassGallery.DisableAll));
    const showAllText = computed(() => fmtMsg(TeacherClassGallery.ShowAll));
    const hideAllText = computed(() => fmtMsg(TeacherClassGallery.HideAll));

    const onClickToggleVideo = () => {
      emit(isAllVideoHidden.value ? "show-all" : "hide-all");
    };

    const onClickToggleAudio = () => {
      emit(isAllAudioMuted.value ? "unmute-all" : "mute-all");
    };

    const onClickStickerAll = () => {
      emit("add-sticker-all");
    };

    const onClickDisableAll = () => {
      if (!isAllPaletteHidden.value) {
        emit("disable-all");
      }
    };

    const isSidebarCollapsed: any = inject("isSidebarCollapsed");

    return {
      onClickDisableAll,
      onClickStickerAll,
      onClickToggleVideo,
      onClickToggleAudio,
      isAllVideoHidden,
      isAllAudioMuted,
      isAllPaletteHidden,
      isSidebarCollapsed,
      stickerAllText,
      unmuteAllText,
      muteAllText,
      enableAllText,
      disableAllText,
      showAllText,
      hideAllText,
    };
  },
});
