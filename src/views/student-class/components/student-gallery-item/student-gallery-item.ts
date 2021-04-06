import { StudentState } from "@/store/room/interface";
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {},
  props: {
    student: { type: Object as () => StudentState, required: true },
    isCurrent: Boolean,
  },
  setup: props => {
    const student = computed(() => props.student).value;
    const store = useStore();

    const isAudioHightlight = computed(() => {
      const enableAudios: Array<string> = store.getters["studentRoom/globalAudios"];
      return student.id && enableAudios.indexOf(student.id) !== -1;
    });

    return {
      isAudioHightlight,
    };
  },
});
