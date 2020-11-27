import { AuthService, LoginInfo } from "@/commonui";
import { computed, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";

export default defineComponent({
  components: {
    MainLayout,
    AppHeader,
    AppFooter,
  },
  created() {
    AuthService.localSilentLogin();
  },
  setup() {
    const { getters, dispatch } = useStore();
    const isHeaderVisible = computed(() => getters.appLayout !== "full");
    const isFooterVisible = computed(() => getters.appLayout !== "full");
    const isSignedIn = computed(() => getters["auth/isLoggedIn"]);
    const appView = computed(() => getters["appView"]);

    watch(isSignedIn, async () => {
      if (isSignedIn.value) {
        const loginInfo: LoginInfo = getters["auth/loginInfo"];
        const isTeacher: boolean = getters["auth/isTeacher"];
        const isParent: boolean = getters["auth/isParent"];
        if (isTeacher) {
          dispatch("teacher/setInfo", {
            id: loginInfo.profile.sub,
            name: loginInfo.profile.name,
          });
          await dispatch("teacher/loadClasses", {
            teacherId: loginInfo.profile.sub,
          });
          dispatch("teacher/loadClassRoom");
        }
        if (isParent) {
          dispatch("parent/setInfo", {
            id: loginInfo.profile.sub,
            name: loginInfo.profile.name,
          });
          dispatch("parent/loadChildren");
        }
      }
    });

    return {
      appView,
      isSignedIn,
      isHeaderVisible,
      isFooterVisible,
    };
  },
});
