import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { RemoteTeachingService } from "@/services";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
export default defineComponent({
  components: {
    ClassCard,
  },
  async created() {
    const store = useStore();
    const logginInfo: LoginInfo = store.getters["auth/loginInfo"];
    if (logginInfo && logginInfo.loggedin) {
      await store.dispatch("teacher/loadClasses", {
        teacherId: logginInfo.profile.sub,
      });
      store.dispatch("teacher/loadClassRoom");
    }
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const classes = computed(() => store.getters["teacher/classes"]);
    const username = computed(() => store.getters["auth/username"]);
    const startClass = async (teacherClass: TeacherClassModel) => {
      try {
        const response = await RemoteTeachingService.teacherStartClassRoom(
          teacherClass.schoolClassId,
          "a462b7c5-1c8d-448d-9fe0-a24a4c2d65b8"
        );
        if (response && response.success) {
          router.replace("/class/" + teacherClass.schoolClassId);
        } else {
          console.log(response);
        }
      } catch (err) {
        
        if (err && err.body) {
          const responseError: {
            Data: string;
            Success: boolean;
          } = err.body;
          console.log(responseError);
        }

      }
    };
    const onClickClass = (teacherClass: TeacherClassModel) => {
      if (teacherClass.isActive) {
        router.replace("/class/" + teacherClass.schoolClassId);
      } else {
        startClass(teacherClass);
      }
    };
    return { classes, username, onClickClass };
  },
});
