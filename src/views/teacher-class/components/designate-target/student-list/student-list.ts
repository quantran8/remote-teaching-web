import { InClassStatus } from "@/store/room/interface";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    id: String,
    index: {
      type: Number,
      required: true
    },
    name: String,
    status: {
      type: Number,
      default: InClassStatus.DEFAULT
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useStore();
    const isNotJoinned = computed(() => props.status !== InClassStatus.JOINED);
    return {
      isNotJoinned
    };
  }
});
