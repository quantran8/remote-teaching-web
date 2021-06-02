import { ChildModel, RemoteTeachingService, StudentGetRoomResponse } from "@/services";
import {computed, ComputedRef, defineComponent, onMounted, ref, watch} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
import { Modal, Checkbox, Button, Row } from "ant-design-vue";
import { fmtMsg } from "commonui";
import { PrivacyPolicy } from "@/locales/localeid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
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
    const policyTitle = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyTitle));
    const policySubtitle = computed(() => fmtMsg(PrivacyPolicy.StudentPolicySubtitle));
    const policyText1 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText1));
    const policyText2 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText2));
    const policyText3 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText3));
    const policyText4 = computed(() => fmtMsg(PrivacyPolicy.StudentPolicyText4));
    const acceptPolicyText = computed(() => fmtMsg(PrivacyPolicy.StudentAcceptPolicy));
    const readPolicy = computed(() => fmtMsg(PrivacyPolicy.ReadPolicy));
    const policyTitleModal = computed(() => fmtMsg(PrivacyPolicy.PrivacyPolicy));
    const policy = computed(() => store.getters["parent/acceptPolicy"]);
    const onClickChild = async (student: ChildModel) => {
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        await RemoteTeachingService.studentGetRoomInfo(student.id, visitorId);
        await store.dispatch("studentRoom/setOnline");
        await router.push(`/student/${student.id}/class/${student.schoolClassId}`);
      } catch (err) {
        // TODO: create a file for declaring const
        // 1 = ConcurrentUserException
        if (err.code === 1) {
          await store.dispatch("setToast", { message: err.message });
        } else {
          const message = computed(() => fmtMsg(PrivacyPolicy.StudentMessageJoin, { studentName: student.name }));
          await store.dispatch("setToast", { message: message });
        }
      }
    };
    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
    };
    const submitPolicy = async () => {
      visible.value = false;
      await RemoteTeachingService.submitPolicy("parent");
      await store.dispatch("parent/setAcceptPolicy");
    };
    const cancelPolicy = () => {
      visible.value = false;
    };
    onMounted(async () => {
      window.addEventListener("keyup", ev => {
        // check press escape key
        if (ev.keyCode === 27) {
          cancelPolicy();
        }
      });
    });
    return {
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
    };
  },
});
