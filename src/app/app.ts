import { useStore } from "vuex";
import { AuthService, LoginInfo, RoleName } from "@/commonui";
import { Modal } from "ant-design-vue";
import { computed, defineComponent, watch } from "vue";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
import { fmtMsg } from "@/commonui";
import { CommonLocale } from "@/locales/localeid";
import { useRoute, useRouter } from "vue-router";
import * as audioSource from "@/utils/audioGenerator";
import { ResourceModel } from "@/models/resource.model";

//5 minutes
const POPUP_TIMING = 6000;

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

    const studentDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnected"]);
    const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
    const loginInfo = computed<LoginInfo>(() => getters["auth/loginInfo"]);
    // const students = computed(() => store.getters["studentRoom/students"]);
    const route = useRoute();

    let timeoutId: any;
    const router = useRouter();

    //handle teacher disconnection

    watch(teacherDisconnected, async isDisconnected => {
      if (isDisconnected) {
        await dispatch("teacherRoom/leaveRoom");
        timeoutId = setTimeout(() => {
          audioSource.teacherTryReconnectSound.stop();
          audioSource.reconnectFailedSound.play();
          dispatch("teacherRoom/endClass");
          router.push("/teacher");
        }, 10000);
        audioSource.teacherTryReconnectSound.play();
        Modal.warning({
          content: "So Sorry! It seems you lost network connectivity.",
          onOk: () => {
            console.log("OK");
          },
        });
        return;
      }
      const { classId } = route.params;
      if (!classId) {
        window.location.reload();

        // const schools: ResourceModel[] =  getters["teacher/schools"]
        // dispatch("teacher/loadClasses", { schoolId: schools[0].id });
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      audioSource.teacherTryReconnectSound.stop();
      audioSource.reconnectSuccessSound.play();
      const loginInfo: LoginInfo = getters["auth/loginInfo"];
      await dispatch("teacherRoom/initClassRoom", {
        classId: classId,
        userId: loginInfo.profile.sub,
        userName: loginInfo.profile.name,
        role: RoleName.teacher,
      });
      await dispatch("teacherRoom/joinRoom");
    });

    //handle student disconnection

    watch(studentDisconnected, async isDisconnected => {
      if (isDisconnected) {
        await dispatch("studentRoom/leaveRoom");
        timeoutId = setTimeout(async () => {
          audioSource.reconnectFailedSound.play();
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
      audioSource.reconnectSuccessSound.play();
      const { studentId, classId } = route.params;
      if (!studentId || !classId) return;
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
      const isTeacher: boolean = getters["auth/isTeacher"];
      const isParent: boolean = getters["auth/isParent"];
      if (isTeacher) {
        dispatch("teacherRoom/setOnline");
      }
      if (isParent) {
        dispatch("studentRoom/setOnline");
      }
    });
    window.addEventListener("offline", () => {
      const isTeacher: boolean = getters["auth/isTeacher"];
      const isParent: boolean = getters["auth/isParent"];
      if (isTeacher) {
        dispatch("teacherRoom/setOffline");
      }
      if (isParent) {
        dispatch("studentRoom/setOffline");
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
