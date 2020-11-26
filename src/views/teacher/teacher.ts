import { LoginInfo } from "@/commonui";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
export default defineComponent({
  components: {
    ClassCard,
  },
  created() {
    const store = useStore();
    const logginInfo: LoginInfo = store.getters["auth/loginInfo"];
    if (logginInfo && logginInfo.loggedin) {
      store.dispatch("teacherRoom/loadRooms");
      store.dispatch("teacherRoom/loadClasses", {
        teacherId: logginInfo.profile.sub,
      });
    }
  },
  setup() {
    const store = useStore();
    const classes = computed(() => store.getters["teacherRoom/classes"]);
    const username = computed(() => store.getters["auth/username"]);
    return { classes, username };
  },
});
