import { AuthService, LoginInfo } from "@/commonui";
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
        dispatch("setAppView", {
          appView: AppView.Authorized,
        });
        const loginInfo: LoginInfo = getters["auth/loginInfo"];
        if (loginInfo) {
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
