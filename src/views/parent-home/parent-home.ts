import { ChildModel, RemoteTeachingService, StudentGetRoomResponse } from "@/services";
import {computed, ComputedRef, defineComponent, ref, watch} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
import { Modal, Checkbox, Button, Row } from "ant-design-vue";
import { fmtMsg } from "commonui";
import { PrivacyPolicy } from "@/locales/localeid";
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
    const policy = computed(() => store.getters["parent/acceptPolicy"]);
    const onClickChild = async (student: ChildModel) => {
      const roomResponse: StudentGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(student.id);
      if (!roomResponse || !roomResponse.data) {
        const message = `${student.name}'s class has not been started`;
        await store.dispatch("setToast", { message: message });
        return;
      }
      await store.dispatch("studentRoom/setOnline");
      await router.push(`/student/${student.id}/class/${student.schoolClassId}`);
    };
    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
    };
    const submitPolicy = async () => {
      visible.value = false;
      await RemoteTeachingService.submitPolicy();
      await store.dispatch("parent/setAcceptPolicy");
    };
    const cancelPolicy = () => {
      visible.value = false;
    };
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
    };
  },
});
