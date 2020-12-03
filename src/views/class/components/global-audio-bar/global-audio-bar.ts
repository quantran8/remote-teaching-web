import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { dispatch, getters } = useStore();
    const globalAudios = computed(() => getters["teacherRoom/globalAudios"]);
    const onDrop = (event: any) => {
      event.preventDefault();
      const studentId = event.dataTransfer.getData("studentId");
      dispatch("teacherRoom/addGlobalAudio", {
        studentId: studentId,
      });
    };
    const onDragOver = (event: any) => {
      event.preventDefault();
    };
    const onClickClearAll = () => {
      dispatch("teacherRoom/clearGlobalAudio");
    };
    return {
      onDragOver,
      onDrop,
      onClickClearAll,
      globalAudios,
    };
  },
});
