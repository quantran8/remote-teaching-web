import { StudentState } from "@/store/room/interface";
import { computed, defineComponent } from "@vue/runtime-core";
import { useStore } from "vuex";
import { gsap } from "gsap";
import { StudentGalleryItem } from "../student-gallery-item";
import { dragscrollNext } from "vue-dragscroll";
import { isMobileBrowser } from "@/utils/utils";

export default defineComponent({
  directives: {
    dragscroll: dragscrollNext,
  },
  components: {
    StudentGalleryItem,
  },
  props: {
    students: {
      type: Object as () => StudentState[],
      required: true,
    },
    isOneToOne: Boolean,
  },
  setup(props) {
    const store = useStore();
    const isVisible = computed(() => store.getters["studentRoom/videosFeedVisible"]);
    const topStudents = computed(() => props.students.slice(0, 11));

    const onEnter = (el: HTMLDivElement) => {
      gsap.from(el.querySelector(".sc-gallery-item"), { translateX: 0, clearProps: "all", translateY: 0, duration: 1, ease: "Power2.easeInOut" });
    };
    const onLeave = (el: HTMLDivElement, done: any) => {
      gsap.to(el.querySelector(".sc-gallery-item"), { translateX: 0, translateY: 0, onComplete: done });
    };

    const toggle = async () => {
      await store.dispatch("studentRoom/toggleVideosFeed");
      await store.dispatch("studentRoom/updateAudioAndVideoFeed");
    };

    const isDisplay = computed(() => {
      return !isMobileBrowser && !props.isOneToOne;
    });

    return { topStudents, onEnter, onLeave, isVisible, toggle, isDisplay };
  },
});
