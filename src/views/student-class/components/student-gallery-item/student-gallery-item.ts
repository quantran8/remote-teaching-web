import { StudentState } from "@/store/room/interface";
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  components: {},
  props: {
    student: Object as () => StudentState,
    isCurrent: Boolean
  }
});
