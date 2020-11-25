import { AuthService, LoginInfo } from "@/commonui";
import { RoomModel } from "@/models";
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
        const isOnlyTeacher: boolean = getters["auth/isOnlyTeacher"];
        if (isOnlyTeacher) {
          dispatch("room/setCurrentUser", {
            id: logginInfo.profile.sub,
            name: logginInfo.profile.name,
          });
          dispatch("room/loadRooms");
          dispatch("room/loadClasses", { teacherId: logginInfo.profile.sub });
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
