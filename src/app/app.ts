import { useDisconnection } from "@/hooks/use-disconnection";
import { CommonLocale } from "@/locales/localeid";
import { AppView, UserRole } from "@/store/app/state";
import { Paths } from "@/utils/paths";
import { Spin } from "ant-design-vue";
import { computed, defineComponent, watch } from "vue";
import { AuthService, fmtMsg, LoginInfo, MainLayout, RoleName } from "vue-glcommonui";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { AppFooter, AppHeader } from "../components/layout";
import { LostNetwork } from "./../locales/localeid";

const PARENT_PATH_REGEX = /\/parent/;
const TEACHER_PATH_REGEX = /\/teacher/;

export default defineComponent({
  components: {
    MainLayout,
    AppHeader,
    AppFooter,
    Spin,
  },
  created() {
    AuthService.localSilentLogin();
  },
  setup() {
    const { getters, dispatch } = useStore();
    const router = useRouter();
    const route = useRoute();
    useDisconnection();
    const isHeaderVisible = computed(() => getters.appLayout !== "full");
    const isFooterVisible = computed(() => getters.appLayout !== "full");
    const loginInfo = computed(() => getters["auth/getLoginInfo"]);
    const isSignedIn = computed(() => getters["auth/isLoggedIn"]);
    const appView = computed(() => getters["appView"]);
    const siteTitle = computed(() => fmtMsg(CommonLocale.CommonSiteTitle));
    const appPath = computed(() => route.path);
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
    };

    const onUserSignedIn = async () => {
      const loginInfo: LoginInfo = getters["auth/getLoginInfo"];
      const isTeacher: boolean = getters["auth/isTeacher"];
      const isParent: boolean = getters["auth/isParent"];
      if (isTeacher) await onTeacherSignedIn(loginInfo);
      if (isParent) {
        await onParentSignedIn(loginInfo);
        checkPolicy("parent");
      }
      await dispatch("loadContentSignature");
    };

    const checkPolicy = async (role: "parent" | "teacher"): Promise<void> => {
      if (role === "parent") {
        const policyAccepted = getters["parent/acceptPolicy"];
        if (!policyAccepted && location.pathname && location.pathname.includes("student")) {
          router.push({ path: Paths.Parent, query: { target: location.pathname } });
        }
      }
    };

    watch(isSignedIn, async () => {
      if (isSignedIn.value) onUserSignedIn();
    });

    watch(loginInfo, (currentLoginInfo: LoginInfo | null) => {
      if (!currentLoginInfo || typeof currentLoginInfo.profile?.remoteTsiSettings === "undefined") return;
      const isTeacher = currentLoginInfo.profile.roles.indexOf(RoleName.teacher) !== -1 && currentLoginInfo.profile.remoteTsiSettings;
      const isParent = currentLoginInfo.profile.roles.indexOf(RoleName.parent) !== -1;
      const { pathname } = window.location;
      if ((!isParent && !isTeacher) || (isParent && isTeacher)) {
        return;
      }
      if (isTeacher) {
        const matchIndex = pathname.search(PARENT_PATH_REGEX);
        if (matchIndex > -1) {
          location.pathname = pathname.replace(PARENT_PATH_REGEX, "/teacher");
        }
      }
      if (isParent) {
        const matchIndex = pathname.search(TEACHER_PATH_REGEX);
        if (matchIndex > -1) {
          location.pathname = pathname.replace(TEACHER_PATH_REGEX, "/parent");
        }
      }
    });

    watch(appPath, () => {
      window.scrollTo(0, 0);
    });

    const messageText = computed(() => fmtMsg(LostNetwork.Message));
    const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
    const userRole = computed(() => getters["userRole"]);
    const isTeacher = computed(() => getters["auth/isTeacher"]);
    const isDisconnectedMode = computed<any>(() => teacherDisconnected.value && userRole.value !== UserRole.UnConfirm);
    const isMaskGrandAccess = computed(() => getters["spin/getMaskGrandAccess"]);
    return {
      siteTitle,
      appView,
      AppView,
      isSignedIn,
      isHeaderVisible,
      isFooterVisible,
      messageText,
      isDisconnectedMode,
      isTeacher,
      isMaskGrandAccess,
    };
  },
});
