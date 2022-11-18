import { VCPlatform } from "@/store/app/state";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { defineComponent } from "@vue/runtime-core";
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import noAvatar from "@/assets/student-class/no-avatar.png";

export default defineComponent({
  components: {},
  props: {
    student: { type: Object as () => StudentState, required: true },
    isCurrent: Boolean,
    raisedHand: Boolean,
  },
  setup: (props) => {
    const student = computed(() => props.student);
    const isNotJoinned = computed(() => student.value.status !== InClassStatus.JOINED);
    const isRaisingHand = ref(false);
    const store = useStore();
    const avatarStudent = computed(() => (student.value.avatar ? student.value.avatar : noAvatar));
    const isUsingAgora = true; // computed(() => store.getters["platform"] === VCPlatform.Agora);

    watch(props, () => {
      if (props.raisedHand) {
        isRaisingHand.value = true;
      } else {
        isRaisingHand.value = false;
      }
    });

    const containerRef = ref<HTMLDivElement>();

    const isSpeaking = computed(() => {
      const speakingUsers: Array<string> = store.getters["studentRoom/speakingUsers"];
      return speakingUsers.indexOf(student.value.id) >= 0;
    });

    const isSupportedVideo = computed(() => !!(window as any).chrome && !(typeof SharedArrayBuffer === "function"));

    return {
      isNotJoinned,
      containerRef,
      isSpeaking,
      isRaisingHand,
      avatarStudent,
      isUsingAgora,
      isSupportedVideo,
    };
  },
});
