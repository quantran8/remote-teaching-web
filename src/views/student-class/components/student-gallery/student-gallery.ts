import { StudentRoomManager } from "@/manager/room/student.manager";
import { store } from "@/store";
import { StudentState } from "@/store/room/interface";
import { isMobileBrowser } from "@/utils/utils";
import { computed, defineComponent } from "@vue/runtime-core";
import { gsap } from "gsap";
import { dragscrollNext } from "vue-dragscroll";
import { MatIcon } from "vue-glcommonui";
import { useStore } from "vuex";
import { StudentGalleryItem } from "../student-gallery-item";

export default defineComponent({
  directives: {
    dragscroll: dragscrollNext,
  },
  components: {
    StudentGalleryItem,
    MatIcon,
  },
  data: () => {
    return {
      timer: null as any,
    };
  },
  mounted() {
    window.addEventListener("resize", this.onWindowResize);
  },
  unmounted() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    async onWindowResize() {
      const roomManager: StudentRoomManager | undefined = store.getters["studentRoom/roomManager"];
      if (this.timer) {
        clearTimeout(this.timer);
      }
      const canvasWrapper = document.getElementById("participant-videos-wrapper");
      if (canvasWrapper) {
        canvasWrapper.style.visibility = "hidden";
      }
      this.timer = setTimeout(async () => {
        await roomManager?.adjustRenderedVideoPosition();
        if (canvasWrapper) {
          canvasWrapper.style.visibility = "visible";
        }
      }, 200);
    },
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
