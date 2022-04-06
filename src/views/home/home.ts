import { fmtMsg } from "vue-glcommonui";
import { HomeLocale } from "@/locales/localeid";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  created() {
    const store = useStore();
    const isOnlyParent = store.getters["auth/isOnlyParent"];
    const isOnlyTeacher = store.getters["auth/isOnlyTeacher"];
    const router = useRouter();
    if (isOnlyParent) {
      router.replace("/parent");
    } else if (isOnlyTeacher) {
      router.replace("/teacher");
    }
  },
  setup() {
    const store = useStore();
    const username = computed(() => store.getters["auth/username"]);
    const welcomeText = computed(() => fmtMsg(HomeLocale.Welcome));
    const chooseRoleText = computed(() => fmtMsg(HomeLocale.ChooseRole));
    const teacherText = computed(() => fmtMsg(HomeLocale.Teacher));
    const studentText = computed(() => fmtMsg(HomeLocale.Student));
    return {
      username,
      welcomeText,
      chooseRoleText,
      teacherText,
      studentText,
    };
  },
});
