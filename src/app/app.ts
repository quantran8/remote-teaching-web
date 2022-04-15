import { useStore } from "vuex";
import { AuthService, RoleName, fmtMsg } from "vue-glcommonui";
import { LoginInfo } from "vue-glcommonui";
import { computed, defineComponent, watch } from "vue";
import { MainLayout } from "vue-glcommonui";
import { AppHeader, AppFooter } from "../components/layout";
import { CommonLocale } from "@/locales/localeid";
import { useDisconnection } from "@/hooks/use-disconnection";
import { AppView, UserRole } from "@/store/app/state";
import { LostNetwork } from "./../locales/localeid";

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
    const loginInfo = computed(() => getters["auth/loginInfo"]);
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

    watch(loginInfo, (currentLoginInfo: LoginInfo | null) => {
      if (!currentLoginInfo || typeof currentLoginInfo.profile.remoteTsiSettings === "undefined") return;
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

    const messageText = computed(() => fmtMsg(LostNetwork.Message));
    const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
    const userRole = computed(() => getters["userRole"]);
    const isTeacher = computed(() => getters["auth/isTeacher"]);
    const isDisconnectedMode = computed<any>(() => teacherDisconnected.value && userRole.value !== UserRole.UnConfirm);

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
    };
  },
});
