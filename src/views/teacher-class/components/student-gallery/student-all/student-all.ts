
import { Logger } from "./../../../../../utils/logger";
import { fmtMsg } from "vue-glcommonui";
import { TeacherClassGallery } from "@/locales/localeid";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, ref, provide, watch } from "vue";
import { useStore } from "vuex";
import StudentCard from "../student-card/student-card.vue";
import { store } from "@/store";
import { PARTICIPANT_CANVAS_ID, PARTICIPANT_GROUPS } from "@/zoom";
import { TeacherRoomManager } from "@/manager/room/teacher.manager";

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
      for (const group of Object.values(PARTICIPANT_GROUPS)) {
        const canvas = document.getElementById(PARTICIPANT_CANVAS_ID + "-" + group) as HTMLCanvasElement;
        if (canvas) {
          canvas.width = studentListElement.offsetWidth;
          canvas.height = studentListElement.offsetHeight;
        }
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
        await roomManager?.rerenderParticipantsVideo();
        if (canvasWrapper) {
          canvasWrapper.style.visibility = "visible";
        }
      }, 100);
    },
    async onStudentListResize() {
      Logger.log("Student list size changed");
      const roomManager: TeacherRoomManager | undefined = store.getters["teacherRoom/roomManager"];
      await roomManager?.rerenderParticipantsVideo();
    },
  },
  setup() {
    const store = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(() => store.getters["teacherRoom/students"]);
    const isGalleryView = computed(() => store.getters["teacherRoom/isGalleryView"]);
    const topStudents = computed(() => students.value.slice(0, 12));
    const oneAndOneStatus = computed(() => {
      return store.getters["teacherRoom/getStudentModeOneId"];
    });
    const noStudentJoinText = computed(() => fmtMsg(TeacherClassGallery.NoStudentJoinClass));

    const studentLayout = ref<number>(3);
    const maximumGroup = ref<number>(2);

    const totalOnlineStudents = ref<number>(0);
    const scaleVideoOption = ref<number>(1.2);
    const lessonPlanCss = ref<string>("");

    watch(isGalleryView, (value) => {
      lessonPlanCss.value = value ? "" : "lesson-plan-mode";
    });

    watch(
      students,
      (value) => {
        const onlineStudents = value.filter((s) => s.status === InClassStatus.JOINED).length;
        totalOnlineStudents.value = onlineStudents;
        if (onlineStudents <= 2) {
          scaleVideoOption.value = 1.2;
          studentLayout.value = 2;
        } else if (onlineStudents <= 3) {
          scaleVideoOption.value = 1.3;
          studentLayout.value = 3;
        } else if (onlineStudents <= 6) {
          scaleVideoOption.value = 1.3;
          studentLayout.value = 6;
        } else {
          scaleVideoOption.value = 1.5;
          studentLayout.value = 12;
        }
		const roomManager: TeacherRoomManager | undefined = store.getters["teacherRoom/roomManager"];
		roomManager?.rerenderParticipantsVideo();
      },
      {
        deep: true,
      },
    );
    const focusedStudent = ref<string>("");
    const updateFocusStudent = (studentId?: string) => {
      if (studentId) {
        return (focusedStudent.value = studentId);
      }
      focusedStudent.value = "";
    };

    provide("updateFocusStudent", updateFocusStudent);
    return {
      students,
      topStudents,
      oneAndOneStatus,
      focusedStudent,
      studentLayout,
      lessonPlanCss,
      totalOnlineStudents,
      scaleVideoOption,
      noStudentJoinText,
      maximumGroup,
    };
  },
});
