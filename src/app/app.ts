import { useStore } from "vuex";
import { AuthService, LoginInfo, RoleName } from "@/commonui";
import { Modal } from "ant-design-vue";
import { computed, defineComponent, watch } from "vue";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
import { fmtMsg } from "@/commonui";
import { Howl, Howler } from "howler";
import { CommonLocale } from "@/locales/localeid";
import { useRoute, useRouter } from "vue-router";

const POPUP_TIMING = 500 * 10;

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
    const isJoined = computed(() => getters["studentRoom/isJoined"]);

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

    const studentIsDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnect"]);

    const reconnectFailedSound = new Howl({
      src: [require(`@/assets/student-class/reconnect-failed.mp3`)],
    });

    const reconnectSuccessSound = new Howl({
      src: [require(`@/assets/student-class/reconnect-success.mp3`)],
    });

    const loginInfo = computed<LoginInfo>(() => getters["auth/loginInfo"])
	console.log('loginInfo', loginInfo);
	
	// const students = computed(() => store.getters["studentRoom/students"]);
    const route = useRoute(); 
	
    let timeoutId: any;
	
    watch(studentIsDisconnected, async isDisconnected => { 
		console.log('isJoined', isJoined);
		
      if (isDisconnected) {
        await dispatch("studentRoom/leaveRoom");
        timeoutId = setTimeout(async () => {
          await reconnectFailedSound.play();
          Modal.warning({
            content: "So Sorry! It seems you lost network connectivity.",
            onOk: () => {
              console.log("OK");
            },
          });
        }, POPUP_TIMING);
        return;
      }
      clearTimeout(timeoutId);
      await reconnectSuccessSound.play();
      const { studentId, classId } = route.params;
      await dispatch("studentRoom/initClassRoom", {
        classId: classId,
        userId: loginInfo.value.profile.sub,
        userName: loginInfo.value.profile.name,
        studentId: studentId,
        role: RoleName.parent,
      });
      await dispatch("studentRoom/joinRoom");
    });

    window.addEventListener("online", () => {
      dispatch("studentRoom/setOnline");
    });
    window.addEventListener("offline", () => {
      dispatch("studentRoom/setOffline");
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
