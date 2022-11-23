import { DeviceTester } from "@/components/common";
import { CommonLocale, PrivacyPolicy } from "@/locales/localeid";
import { ClassRoomStatus } from "@/models";
import { ChildModel, RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { AppView } from "@/store/app/state";
import { Logger } from "@/utils/logger";
import { queryStringToObject } from "@/utils/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button, Checkbox, Modal, notification, Row } from "ant-design-vue";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ParentHomeLocale } from "./../../locales/localeid";
import StudentCard from "./components/student-card/student-card.vue";

const fpPromise = FingerprintJS.load();

const refreshTiming = 3000 * 10;

export default defineComponent({
  components: {
    StudentCard,
    Modal,
    Checkbox,
    Button,
    Row,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const children = computed(() => store.getters["parent/children"]);
    const username = computed(() => store.getters["auth/username"]);
    const visible = ref<boolean>(true);
    const agreePolicy = ref<boolean>(false);
    const welcomeText = computed(() => fmtMsg(ParentHomeLocale.Welcome));
    const chooseStudentText = computed(() => fmtMsg(ParentHomeLocale.ChooseStudent));
    const cancelText = computed(() => fmtMsg(ParentHomeLocale.Cancel));
    const submitText = computed(() => fmtMsg(ParentHomeLocale.Submit));
    const policyTitle = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyTitle));
    const policySubtitle = computed(() => fmtMsg(PrivacyPolicy.StudentPolicySubtitle));
    const policyText1 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText1));
    const policyText2 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText2));
    const policyText3 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText3));
    const policyText4 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText4));
    const acceptPolicyText = computed(() => fmtMsg(PrivacyPolicy.StudentAcceptPolicy));
    const readPolicy = computed(() => fmtMsg(PrivacyPolicy.ReadPolicy));
    const policyTitleModal = computed(() => fmtMsg(PrivacyPolicy.PrivacyPolicy));
    const accessDenied = computed(() => fmtMsg(CommonLocale.CommonAccessDenied));
    const policy = computed(() => store.getters["parent/acceptPolicy"]);
    const concurrent = ref<boolean>(false);
    const concurrentMess = ref("");
    const studentVideoMirror = ref(false);
    const listSessionInfo = ref([]);
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const classIsActive = ref(false);
    const currentStudent = ref<ChildModel>();
    const getRoomInfoError = ref<string>("");
    const getRoomInfoErrorByMsg = ref<string>("");
    const goToClass = async () => {
      await store.dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
      deviceTesterRef.value?.handleGoToClassSuccess();
      router.push(`/student/${currentStudent.value?.id}/class/${currentStudent.value?.schoolClassId}`);
    };

    const getRoomInfoTimeout = ref<null | ReturnType<typeof setTimeout>>(null);

    const onClickChild = async (student: ChildModel) => {
      currentStudent.value = student;
      deviceTesterRef.value?.showModal();
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      const getRoomInfo = async () => {
        try {
          const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(student.id, visitorId);
          studentVideoMirror.value = !!roomResponse?.data?.isStudentVideoMirror;
          getRoomInfoError.value = "";
          getRoomInfoErrorByMsg.value = "";
          await store.dispatch("studentRoom/setOnline");
          await store.dispatch("setVideoCallPlatform", roomResponse.data.videoPlatformProvider);

          if (getRoomInfoTimeout.value) {
            clearTimeout(getRoomInfoTimeout.value);
            getRoomInfoTimeout.value = null;
          }
          classIsActive.value = true;
        } catch (err) {
          getRoomInfoError.value = err?.code;
          getRoomInfoErrorByMsg.value = err?.message;
          if (classIsActive.value) {
            classIsActive.value = false;
          }
          if (err?.code === 0) {
            getRoomInfoTimeout.value = setTimeout(() => {
              getRoomInfo();
            }, refreshTiming);
          }
        }
      };
      await getRoomInfo();
    };

    const getNextSessionInfo = async () => {
      try {
        const listIds = children.value.map((child: any) => {
          return child.id;
        });
        const response = await RemoteTeachingService.getStudentNextSession(listIds);
        if (response && response.length > 0) {
          listSessionInfo.value = response;
        }
      } catch (err) {
        Logger.log(err);
      }
    };
    const studentNextSessionInfo = (childrenId: string) => {
      const info = listSessionInfo.value.filter((session: any) => {
        return session.studentId == childrenId;
      });
      if (info) {
        return info[0];
      }
      return null;
    };
    watch(children, async () => {
      if (children.value) {
        await getNextSessionInfo();
      }
    });
    onMounted(async () => {
      await store.dispatch("parent/loadChildren");
    });
    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
    };
    const submitPolicy = async () => {
      visible.value = false;
      try {
        await RemoteTeachingService.submitPolicy("parent");
        await store.dispatch("parent/setAcceptPolicy");
        const policyAccepted = computed(() => store.getters["parent/acceptPolicy"]);
        if (policyAccepted.value) {
          const queryStringObj = queryStringToObject();
          if (queryStringObj?.target) {
            router.push(queryStringObj.target);
          }
        } else {
          store.dispatch("setAppView", { appView: AppView.UnAuthorized });
        }
      } catch (error) {
        notification.error({
          message: error.message,
        });
      }
    };
    const cancelPolicy = async () => {
      visible.value = false;
      if (!policy.value) {
        await store.dispatch("setAppView", { appView: AppView.UnAuthorized });
      }
    };

    const escapeEvent = async (ev: KeyboardEvent) => {
      // check press escape key
      if (ev.keyCode === 27) {
        await cancelPolicy();
      }
    };
    onMounted(async () => {
      if (children.value) {
        await getNextSessionInfo();
      }
      window.addEventListener("keyup", escapeEvent);
    });

    onUnmounted(async () => {
      window.removeEventListener("keyup", escapeEvent);
    });

    const onDevicesModalClose = () => {
      if (getRoomInfoTimeout.value) {
        clearTimeout(getRoomInfoTimeout.value);
        getRoomInfoTimeout.value = null;
      }
    };

    const formatName = (englishName: string, nativeName: string) => {
      if (englishName && englishName.toLowerCase() != nativeName.toLowerCase()) {
        nativeName = englishName + ` (${nativeName})`;
      }
      return nativeName;
    };
    return {
      formatName,
      welcomeText,
      chooseStudentText,
      cancelText,
      submitText,
      children,
      username,
      onClickChild,
      visible,
      agreePolicy,
      onAgreePolicy,
      submitPolicy,
      policyText1,
      policyText2,
      policyText3,
      policyText4,
      policy,
      cancelPolicy,
      policyTitle,
      policySubtitle,
      acceptPolicyText,
      readPolicy,
      policyTitleModal,
      concurrent,
      concurrentMess,
      accessDenied,
      studentNextSessionInfo,
      deviceTesterRef,
      classIsActive,
      goToClass,
      getRoomInfoError,
      getRoomInfoErrorByMsg,
      onDevicesModalClose,
      studentVideoMirror,
    };
  },
});
