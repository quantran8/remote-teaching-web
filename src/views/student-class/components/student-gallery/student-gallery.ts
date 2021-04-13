import { StudentState } from "@/store/room/interface";
import { computed, defineComponent } from "@vue/runtime-core";
import { gsap } from "gsap";
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
    raisedHand: Boolean,
  },
  setup(props) {
    const topStudents = computed(() => props.students.slice(0, 10));

    const onEnter = (el: HTMLDivElement) => {
      gsap.from(el.querySelector(".sc-gallery-item"), { translateX: 0, clearProps: "all", translateY: 0, duration: 1, ease: "Power2.easeInOut" });
    };
    const onLeave = (el: HTMLDivElement, done: any) => {
      gsap.to(el.querySelector(".sc-gallery-item"), { translateX: 0, translateY: 0, onComplete: done });
    };

    return { topStudents, onEnter, onLeave };
  },
});
