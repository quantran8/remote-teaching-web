import { StudentState } from "@/store/room/interface";
import { defineComponent } from "@vue/runtime-core";
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {},
  props: {
    student: { type: Object as () => StudentState, required: true },
    isCurrent: Boolean,
    isOneToOne: Boolean,
    raisedHand: Boolean,
  },
  setup: props => {
    const student = computed(() => props.student).value;
    const raisedHand = computed(() => props.raisedHand);
    const store = useStore();

    const containerRef = ref<HTMLDivElement>();

    const isAudioHighlight = computed(() => {
      const enableAudios: Array<string> = store.getters["studentRoom/globalAudios"];
      return student.id && enableAudios.indexOf(student.id) !== -1;
    });

    const isSpeaking = computed(() => {
      const speakingUsers: Array<string> = store.getters["studentRoom/speakingUsers"];
      return speakingUsers.indexOf(student.id) >= 0;
    });

    watch(raisedHand, value => {
      if (value) {
        containerRef.value?.classList.add("sc-gallery-item--help");
      } else {
        containerRef.value?.classList.remove("sc-gallery-item--help");
      }
    });

    return {
      isAudioHighlight,
      containerRef,
      isSpeaking,
    };
  },
});
