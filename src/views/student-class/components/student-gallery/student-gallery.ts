import { computed, defineComponent } from "@vue/runtime-core";
import { StudentState } from "@/store/room/interface";
import { StudentGalleryItem } from "../student-gallery-item";

export default defineComponent({
  components: {
    StudentGalleryItem,
  },
  props: {
    currentStudent: {
      type: Object as () => StudentState,
      required: true,
    },
    students: {
      type: Object as () => StudentState[],
      required: true,
    },
    isOneToOne: Boolean,
  },
  setup(props) {
    const topStudents = computed(() => props.students.slice(0, 10));
    return { topStudents };
  },
});
