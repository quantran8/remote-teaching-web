import { TeacherClassGallery } from "@/locales/localeid";
import { TeacherRoomManager } from "@/manager/room/teacher.manager";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { Logger } from "@/utils/logger";
import { PARTICIPANT_CANVAS_ID } from "@/zoom";
import { useElementSize } from "@vueuse/core";
import { computed, ComputedRef, defineComponent, nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useStore } from "vuex";
import StudentCard from "../student-card/student-card.vue";

export default defineComponent({
  components: {
    StudentCard,
  },
  data: () => {
    return {
      timer: null as any,
    };
  },
  async mounted() {
    window.addEventListener("resize", this.onWindowResize);
    try {
      const studentListElement = document.getElementById("student-list") as HTMLDivElement;
      const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      if (canvas) {
        canvas.width = studentListElement.offsetWidth;
        canvas.height = studentListElement.offsetHeight;
      }
    } catch (error) {
      Logger.error("Set canvas error: ", error);
    }
  },
  unmounted() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    async onWindowResize() {
      const roomManager: TeacherRoomManager | undefined = store.getters["teacherRoom/roomManager"];
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
      }, 100);
    },
    // async onStudentListResize() {
    //   Logger.log("Student list size changed");
    //   const roomManager: TeacherRoomManager | undefined = store.getters["teacherRoom/roomManager"];
    //   await roomManager?.adjustRenderedVideoPosition();
    // },
  },
  setup() {
    const store = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(() => store.getters["teacherRoom/students"]);
    const manager = computed<TeacherRoomManager>(() => store.getters["teacherRoom/roomManager"]);
    const platform = computed(() => store.getters["platform"]);
    const topStudents = computed(() => students.value.slice(0, 12));
    const oneAndOneStatus = computed(() => {
      return store.getters["teacherRoom/getStudentModeOneId"];
    });
    const noStudentJoinText = computed(() => fmtMsg(TeacherClassGallery.NoStudentJoinClass));

    const studentGallery = ref<HTMLElement>();
    const { width: studentGalleryWidth } = useElementSize(studentGallery);
    const breakpoints = 450;
    const totalOnlineStudents = computed(() => {
      return students.value.filter((s) => s.status === InClassStatus.JOINED).length;
    });

    const studentLayout = computed(() => {
      if (totalOnlineStudents.value <= 2 || (totalOnlineStudents.value <= 6 && studentGalleryWidth.value < breakpoints)) return "student-layout-1";
      if (totalOnlineStudents.value <= 6 || (totalOnlineStudents.value > 6 && studentGalleryWidth.value < breakpoints)) return "student-layout-2";
      return "student-layout-3";
    });

    const scaleVideoOption = computed(() => {
      if (totalOnlineStudents.value <= 3) return 1.6;
      if (totalOnlineStudents.value <= 6) return 1.4;
      return 2;
    });

    const focusedStudent = ref<string>("");
    const updateFocusStudent = (studentId?: string) => {
      if (studentId) {
        return (focusedStudent.value = studentId);
      }
      focusedStudent.value = "";
    };
    const adjustRenderedVideoPosition = async (e: any) => {
      if (!manager.value) {
        return;
      }
      if (e.propertyName === "margin-left") {
        await manager.value.adjustRenderedVideoPosition();
      } else if (e.propertyName === "width") {
        await manager.value.adjustRenderedVideoPosition(e.target.id.split("__")[0]);
      }
    };
    watch(totalOnlineStudents, async () => {
      if (!manager.value) {
        return;
      }
      await nextTick();
      await manager.value.adjustRenderedVideoPosition();
    });
    const sidebarEl = ref<HTMLDivElement>();
    const studentListEl = ref<HTMLDivElement>();
    onMounted(() => {
      if (platform.value === VCPlatform.Zoom) {
        sidebarEl.value = document.getElementById("tc__sidebar") as HTMLDivElement;
        studentListEl.value = document.getElementById("student-list") as HTMLDivElement;
        sidebarEl.value.addEventListener("transitionend", adjustRenderedVideoPosition);
        studentListEl.value.addEventListener("transitionend", adjustRenderedVideoPosition);
      }
    });
    onUnmounted(() => {
      if (platform.value === VCPlatform.Zoom && sidebarEl.value && studentListEl.value) {
        sidebarEl.value.removeEventListener("transitionend", adjustRenderedVideoPosition);
        studentListEl.value.removeEventListener("transitionend", adjustRenderedVideoPosition);
      }
    });

    provide("updateFocusStudent", updateFocusStudent);
    return {
      students,
      topStudents,
      oneAndOneStatus,
      focusedStudent,
      totalOnlineStudents,
      scaleVideoOption,
      noStudentJoinText,
      studentLayout,
      studentGallery,
    };
  },
});
