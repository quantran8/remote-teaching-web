import { AGORA_APP_CERTIFICATE, AGORA_APP_ID } from "@/agora/agora.config";
import { AuthService, LoginInfo, RoleName } from "@/commonui";
import { RTRoomManager } from "@/manager/room.manager";
import { AppView } from "@/store/app/state";
import { computed, defineComponent, watch } from "vue";
// import { useRouter } from "vue-router";
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
    // const router = useRouter();
    watch([isSignedIn], () => {
      if (!isSignedIn.value) {
        // router.replace("/");
      } else {
        dispatch("setAppView", { appView: AppView.Authorized });
        const loginInfo: LoginInfo = getters["auth/loginInfo"];
        console.log("LoginInfo", loginInfo);
        const isLoggedIn = loginInfo && loginInfo.loggedin;
        const isParent =
          loginInfo &&
          loginInfo.profile &&
          loginInfo.profile.roles.indexOf(RoleName.parent) !== -1;
        const isTeacher =
          loginInfo &&
          loginInfo.profile &&
          loginInfo.profile.roles.indexOf(RoleName.teacher) !== -1;

        if (isLoggedIn && isParent) {
          dispatch("parent/setInfo", {
            id: loginInfo.profile.sub,
            name: loginInfo.profile.name,
          });
          dispatch("parent/loadChildren");
        }

        if (isLoggedIn && isTeacher) {
          dispatch("teacher/setInfo", {
            id: loginInfo.profile.sub,
            name: loginInfo.profile.name,
          });
          dispatch("teacher/loadClasses");
        }

        RTRoomManager.init({
          agora: {
            appId: AGORA_APP_ID,
            appCertificate: AGORA_APP_CERTIFICATE,
            webConfig: {
              mode: "rtc",
              codec: "vp8",
            },
            user: {
              channel: "remote_teaching",
              username: loginInfo.profile.name.toLowerCase().replace(/ /g, ""),
              role: isTeacher ? "host" : "audience",
            },
          },
        });
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
