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

    watch(isSignedIn, () => {
      if (isSignedIn.value) {
        const logginInfo: LoginInfo = getters["auth/loginInfo"];
        const isTeacher: boolean = getters["auth/isTeacher"];
        const isParent: boolean = getters["auth/isParent"];
        if (isTeacher) {
          dispatch("teacherRoom/setUser", {
            id: logginInfo.profile.sub,
            name: logginInfo.profile.name,
          });
          dispatch("teacherRoom/loadRooms");
          dispatch("teacherRoom/loadClasses", { teacherId: logginInfo.profile.sub });
        }
        if (isParent) {
          // dispatch("teacherRoom/setUser", {
          //   id: logginInfo.profile.sub,
          //   name: logginInfo.profile.name,
          // });
          // dispatch("teacherRoom/loadRooms");
          // dispatch("teacherRoom/loadClasses", { teacherId: logginInfo.profile.sub });
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
