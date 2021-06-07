import { useStore } from "vuex";
import { AuthService, LoginInfo } from "@/commonui";
import { computed, defineComponent, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
import { fmtMsg } from "@/commonui";
import { CommonLocale } from "@/locales/localeid";
import { useDisconnection } from "@/hooks/use-disconnection";

const PARENT_PATH_REGEX = /\/parent/;
const TEACHER_PATH_REGEX = /\/teacher/;

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
    useDisconnection();
    const isHeaderVisible = computed(() => getters.appLayout !== "full");
    const isFooterVisible = computed(() => getters.appLayout !== "full");
    const isSignedIn = computed(() => getters["auth/isLoggedIn"]);
    const appView = computed(() => getters["appView"]);
    const siteTitle = computed(() => fmtMsg(CommonLocale.CommonSiteTitle));
    const onTeacherSignedIn = async (loginInfo: LoginInfo) => {
      await dispatch("teacher/setInfo", {
        id: loginInfo.profile.sub,
        name: loginInfo.profile.name,
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
      if (isTeacher) await onTeacherSignedIn(loginInfo);
      if (isParent) await onParentSignedIn(loginInfo);
      await dispatch("loadContentSignature");
    };

    watch(isSignedIn, async () => {
      if (isSignedIn.value) onUserSignedIn();
    });

    const route = useRoute();
    const router = useRouter();
    watch(route, () => {
      const isTeacher: boolean = getters["auth/isTeacher"];
      const isParent: boolean = getters["auth/isParent"];
	  if((!isParent && !isTeacher) || (isParent && isTeacher)) return
      if (isTeacher) {
        const matchIndex = route.path.search(PARENT_PATH_REGEX);
        if (matchIndex > -1) {
          router.push(route.path.replace(PARENT_PATH_REGEX, "/teacher"));
        }
      }
      if (isParent) {
        const matchIndex = route.path.search(TEACHER_PATH_REGEX);
        if (matchIndex > -1) {
          router.push(route.path.replace(TEACHER_PATH_REGEX, "/parent"));
        }
      }
    });

    return {
      siteTitle,
      appView,
      isSignedIn,
      isHeaderVisible,
      isFooterVisible,
    };
  },
});
