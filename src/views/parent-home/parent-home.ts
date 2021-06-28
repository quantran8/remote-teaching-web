import { ParentHomeLocale } from "./../../locales/localeid";
import { ChildModel, RemoteTeachingService } from "@/services";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
import { Modal, Checkbox, Button, Row } from "ant-design-vue";
import { ErrorCode, fmtMsg } from "commonui";
import { CommonLocale, PrivacyPolicy } from "@/locales/localeid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { AppView } from "@/store/app/state";
const fpPromise = FingerprintJS.load();

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
    const listSessionInfo = ref([]);
    const onClickChild = async (student: ChildModel) => {
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        await RemoteTeachingService.studentGetRoomInfo(student.id, visitorId);
        await store.dispatch("studentRoom/setOnline");
        await router.push(`/student/${student.id}/class/${student.schoolClassId}`);
      } catch (err) {
        if (err.code === ErrorCode.ConcurrentUserException) {
          await store.dispatch("setToast", { message: err.message });
        } else {
          const message = computed(() => fmtMsg(PrivacyPolicy.StudentMessageJoin, { studentName: student.englishName }));
          await store.dispatch("setToast", { message: message });
        }
      }
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
        console.log(err);
      }
    };
    const studentNextSessionInfo = (childrenId: string) => {
      const info = listSessionInfo.value.filter((session: any) => {
        return session.studentId == childrenId;
      })[0];
      return info;
    };
    watch(children, () => {
      if (children.value) getNextSessionInfo();
    });
    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
    };
    const submitPolicy = async () => {
      visible.value = false;
      await RemoteTeachingService.submitPolicy("parent");
      await store.dispatch("parent/setAcceptPolicy");
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
      if (children.value) getNextSessionInfo();
      window.addEventListener("keyup", escapeEvent);
    });

    onUnmounted(async () => {
      window.removeEventListener("keyup", escapeEvent);
    });

    return {
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
    };
  },
});
