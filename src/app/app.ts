import { useStore } from "vuex";
import { AuthService, LoginInfo } from "@/commonui";
import { computed, defineComponent, watch } from "vue";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
import { ContentService } from "@/services";

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

    const onTeacherSignedIn = async (loginInfo: LoginInfo) => {
      await dispatch("teacher/setInfo", {
        id: loginInfo.profile.sub,
        name: loginInfo.profile.name,
      });
      await dispatch("teacher/loadClasses", {
        teacherId: loginInfo.profile.sub,
      });
    };

    const onParentSignedIn = async (loginInfo: LoginInfo) => {
      await dispatch("parent/setInfo", {
        id: loginInfo.profile.sub,
        name: loginInfo.profile.name,
      });
      await dispatch("parent/loadChildren");
    };

    const onUserSignedIn = async () => {
      const loginInfo: LoginInfo = getters["auth/loginInfo"];
      const isTeacher: boolean = getters["auth/isTeacher"];
      const isParent: boolean = getters["auth/isParent"];
      if (isTeacher) onTeacherSignedIn(loginInfo);
      if (isParent) onParentSignedIn(loginInfo);
      dispatch("auth/loadContentSignature");
    };

    watch(isSignedIn, async () => {
      if (isSignedIn.value) onUserSignedIn();
    });

    return {
      appView,
      isSignedIn,
      isHeaderVisible,
      isFooterVisible,
    };
  },
});
