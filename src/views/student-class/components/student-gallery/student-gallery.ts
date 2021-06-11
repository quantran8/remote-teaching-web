import { StudentState } from "@/store/room/interface";
import { computed, defineComponent } from "@vue/runtime-core";
import { gsap } from "gsap";
import { StudentGalleryItem } from "../student-gallery-item";
import { dragscrollNext } from "vue-dragscroll";
import { MatIcon } from "@/commonui";
import { ref } from "vue";

console.log("dragscrollNext", dragscrollNext);

export default defineComponent({
  directives: {
    dragscroll: dragscrollNext,
  },
  components: {
    StudentGalleryItem,
    MatIcon,
  },
  props: {
    students: {
      type: Object as () => StudentState[],
      required: true,
    },
    isOneToOne: Boolean,
  },
  setup(props) {
    const topStudents = computed(() => props.students.slice(0, 11));
    const isVisible = ref<boolean>(false);

    const onEnter = (el: HTMLDivElement) => {
      gsap.from(el.querySelector(".sc-gallery-item"), { translateX: 0, clearProps: "all", translateY: 0, duration: 1, ease: "Power2.easeInOut" });
    };
    const onLeave = (el: HTMLDivElement, done: any) => {
      gsap.to(el.querySelector(".sc-gallery-item"), { translateX: 0, translateY: 0, onComplete: done });
    };

    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    return { topStudents, onEnter, onLeave, isVisible, toggle };
  },
});
