import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import { computed, defineComponent, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
import { ResourceModel } from "@/models/resource.model";
import { Select, Spin, Modal, Checkbox, Button, Row, Empty } from "ant-design-vue";
import { fmtMsg } from "@/commonui";
import { CommonLocale, PrivacyPolicy } from "@/locales/localeid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { AppView } from "@/store/app/state";
const fpPromise = FingerprintJS.load();

export default defineComponent({
  components: {
    ClassCard,
    Select,
    Spin,
    Option: Select.Option,
    Modal,
    Checkbox,
    Button,
    Row,
    Empty
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const schools = computed<ResourceModel[]>(() => store.getters["teacher/schools"]);
    //const classes = computed(() => store.getters["teacher/classes"]);
    const classesSchedules = computed(() => store.getters["teacher/classesSchedules"]);
    const username = computed(() => store.getters["auth/username"]);
    const filteredSchools = ref<ResourceModel[]>(schools.value);
    const loading = ref<boolean>(false);
    const disabled = ref<boolean>(false);
    const haveClassActive = ref(false);
    const classActive = ref();
    const visible = ref<boolean>(true);
    const agreePolicy = ref<boolean>(false);
    const policyTitle = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyTitle));
    const policySubtitle = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicySubtitle));
    const policyText1 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText1));
    const policyText2 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText2));
    const policyText3 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText3));
    const policyText4 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText4));
    const acceptPolicyText = computed(() => fmtMsg(PrivacyPolicy.TeacherAcceptPolicy));
    const readPolicy = computed(() => fmtMsg(PrivacyPolicy.ReadPolicy));
    const policyTitleModal = computed(() => fmtMsg(PrivacyPolicy.PrivacyPolicy));
    const accessDenied = computed(() => fmtMsg(CommonLocale.CommonAccessDenied));
    const policy = computed(() => store.getters["teacher/acceptPolicy"]);
    const currentSchoolId = ref("");
    const concurrent = ref<boolean>(false);
    const concurrentMess = ref("");
    const loadingStartClass = ref<boolean>(true);
    const startClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      try {
        const fp = await fpPromise;
        const result = await fp.get();
        const visitorId = result.visitorId;
        await RemoteTeachingService.getActiveClassRoom(visitorId);
        const response = await RemoteTeachingService.teacherStartClassRoom(teacherClass.classId, groupId);
        if (response && response.success) {
          await router.push("/class/" + teacherClass.classId);
        }
      } catch (err) {
        loadingStartClass.value = false;
        const message = err.body.message;
        await store.dispatch("setToast", { message: message });
      }
    };

    const onClickCalendar = async () => {
      await router.push(`/teacher-calendars/${currentSchoolId.value}`);
    };

    const getSchools = async () => {
      loading.value = true;
      await store.dispatch("teacher/loadAccessibleSchools", {
        disabled: false,
      } as AccessibleSchoolQueryParam);
      filteredSchools.value = schools.value;
      loading.value = false;
    };

    const onSchoolChange = async (schoolId: string) => {
      loading.value = true;
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        //await store.dispatch("teacher/loadClasses", { schoolId: schoolId, browserFingerPrinting: visitorId});
        await store.dispatch("teacher/loadAllClassesSchedules", { schoolId: schoolId, browserFingerPrinting: visitorId});
        filteredSchools.value = schools.value;
        currentSchoolId.value = schoolId;
      } catch (err) {
        // concurrent.value = true;
        // concurrentMess.value = err.body.message;
        if(err != null) {
          await store.dispatch("setToast", { message: err.body.message });
        }
      }
      loading.value = false;
    };

    const onClickClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      if (teacherClass.isActive) {
        await router.push("/class/" + teacherClass.classId);
      } else {
        await startClass(teacherClass, groupId);
      }
    };

    const filterSchools = (input: string, option: any) => option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
    };
    const submitPolicy = async () => {
      visible.value = false;
      await RemoteTeachingService.submitPolicy("teacher");
      await store.dispatch("teacher/setAcceptPolicy");
      await onSchoolChange(schools.value[0].id);
    };
    const cancelPolicy = async () => {
      visible.value = false;
      await store.dispatch("setAppView", { appView: AppView.UnAuthorized });
    };

    onMounted(async () => {
      const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
      if (loginInfo && loginInfo.loggedin) {
        await getSchools();
        if (schools.value?.length) {
          await onSchoolChange(schools.value[0].id);
          if (schools.value.length === 1) {
            disabled.value = true;
          }
        }
      }
      await store.dispatch("teacher/clearSchedules");
      if (classesSchedules.value) {
        classesSchedules.value.map((cl: TeacherClassModel) => {
          if (cl.isActive) {
            classActive.value = cl;
            haveClassActive.value = true;
          }
        });
      }
      window.addEventListener("keyup", ev => {
        // check press escape key
        if (ev.keyCode === 27) {
          cancelPolicy();
        }
      });
    });

    const hasClassesShowUp = () => {
      if (loading.value == false) {
        return classesSchedules.value.length != 0;
      } else {
        return true;
      }
    }

    const hasClassesShowUpSchedule = () => {
      if (loading.value == false) {
        return classesSchedules.value.length != 0;
      } else return loading.value != true;
    }

    return {
      schools,
      //classes,
      classesSchedules,
      haveClassActive,
      classActive,
      username,
      onClickClass,
      filterSchools,
      onSchoolChange,
      loading,
      disabled,
      filteredSchools,
      visible,
      submitPolicy,
      agreePolicy,
      onAgreePolicy,
      policyText1,
      policyText2,
      policyText3,
      policyText4,
      policy,
      cancelPolicy,
      onClickCalendar,
      policyTitle,
      policySubtitle,
      acceptPolicyText,
      readPolicy,
      policyTitleModal,
      concurrent,
      concurrentMess,
      accessDenied,
      loadingStartClass,
      hasClassesShowUp,
      hasClassesShowUpSchedule,
    };
  },
});
