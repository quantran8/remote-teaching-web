import { fmtMsg } from "vue-glcommonui";
import { TeacherClassGallery } from "@/locales/localeid";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, ref, provide, watch } from "vue";
import { useStore } from "vuex";
import StudentCard from "../student-card/student-card.vue";

export default defineComponent({
  components: {
    StudentCard,
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
    const totalOnlineStudents = ref<number>(0);
    const scaleVideoOption = ref<number>(1.6);
    const lessonPlanCss = ref<string>("");

    watch(isGalleryView, (value) => {
      lessonPlanCss.value = value ? "" : "lesson-plan-mode";
    });

    watch(
      students,
      (value) => {
        const onlineStudents = value.filter((s) => s.status === InClassStatus.JOINED).length;
        totalOnlineStudents.value = onlineStudents;
        if (onlineStudents <= 3) {
          scaleVideoOption.value = 1.6;
          studentLayout.value = 3;
        } else if (onlineStudents <= 6) {
          studentLayout.value = 6;
          scaleVideoOption.value = 1.4;
        } else {
          studentLayout.value = 12;
          scaleVideoOption.value = 2;
        }
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
    };
  },
});
