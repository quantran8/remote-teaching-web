import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { dispatch, getters } = useStore();
    const globalAudios = computed(() => getters["teacherRoom/globalAudios"]);
    const onDrop = async (event: any) => {
      event.preventDefault();
      const studentId = event.dataTransfer.getData("studentId");
      await dispatch("teacherRoom/addGlobalAudio", {
        id: studentId,
      });
    };
    const onDragOver = (event: any) => {
      event.preventDefault();
    };
    const onClickClearAll = async () => {
      await dispatch("teacherRoom/clearGlobalAudio");
    };
    return {
      onDragOver,
      onDrop,
      onClickClearAll,
      globalAudios,
    };
  },
});
