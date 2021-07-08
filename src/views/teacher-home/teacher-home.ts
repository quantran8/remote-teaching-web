import { TeacherHome } from "./../../locales/localeid";
import { LoginInfo } from "@/commonui";
import { TeacherClassModel, UnitAndLesson } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import { computed, defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
import { ResourceModel } from "@/models/resource.model";
import { Select, Spin, Modal, Checkbox, Button, Row, Empty } from "ant-design-vue";
import { fmtMsg } from "@/commonui";
import { CommonLocale, PrivacyPolicy } from "@/locales/localeid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { AppView } from "@/store/app/state";
import { JoinSessionModel } from "@/models/join-session.model";
import { DeviceTester } from "@/components/common";

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
    Empty,
    DeviceTester,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const schools = computed<ResourceModel[]>(() => store.getters["teacher/schools"]);
    //const classes = computed(() => store.getters["teacher/classes"]);
    const classesSchedules = computed(() => store.getters["teacher/classesSchedules"]);
    const classOnline = computed(() => store.getters["teacher/getClassOnline"]);
    const username = computed(() => store.getters["auth/username"]);
    const filteredSchools = ref<ResourceModel[]>(schools.value);
    const loading = ref<boolean>(false);
    const popUpLoading = ref<boolean>(false);
    const disabled = ref<boolean>(false);
    const visible = ref<boolean>(true);
    const startPopupVisible = ref<boolean>(false);
    const messageStartClass = ref("");
    const infoStart = ref<{ teacherClass: TeacherClassModel; groupId: string }>();
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
    const welcomeText = computed(() => fmtMsg(TeacherHome.Welcome));
    const scheduleText = computed(() => fmtMsg(TeacherHome.Schedule));
    const cancelText = computed(() => fmtMsg(TeacherHome.Cancel));
    const submitText = computed(() => fmtMsg(TeacherHome.Submit));
    const policy = computed(() => store.getters["teacher/acceptPolicy"]);
    const currentSchoolId = ref("");
    const concurrent = ref<boolean>(false);
    const concurrentMess = ref("");
    const loadingStartClass = ref<boolean>(true);
    const unitInfo = ref<UnitAndLesson[]>();
    const loadingInfo = ref(false);
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const selectedGroupId = ref();

    const startClass = async (teacherClass: TeacherClassModel, groupId: string, unit: number, lesson: number) => {
      messageStartClass.value = "";
      try {
        const fp = await fpPromise;
        const result = await fp.get();
        const resolution = window.screen.width * window.devicePixelRatio + "x" + window.screen.height * window.devicePixelRatio;
        const model: JoinSessionModel = {
          classId: teacherClass.classId,
          groupId: groupId,
          resolution,
          unit: unit,
          lesson: lesson,
          browserFingerprint: result.visitorId,
        };
        const response = await RemoteTeachingService.teacherStartClassRoom(model);
        if (response && response.success) {
          deviceTesterRef.value?.handleGoToClassSuccess();
          await router.push("/class/" + teacherClass.classId);
        }
      } catch (err) {
        loadingStartClass.value = false;
        const message = err?.body?.message;
        if (message) {
          messageStartClass.value = message;
        }
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
        await store.dispatch("teacher/loadAllClassesSchedules", {
          schoolId: schoolId,
          browserFingerPrinting: visitorId,
        });
        filteredSchools.value = schools.value;
        currentSchoolId.value = schoolId;
      } catch (err) {
        // concurrent.value = true;
        // concurrentMess.value = err.body.message;
        if (err.body.message) {
          await store.dispatch("setToast", { message: err.body.message });
        }
      }
      loading.value = false;
    };

    const joinTheCurrentSession = async (currentGroupId: string) => {
      if (classOnline.value && currentGroupId == classOnline.value.groupId) {
        await router.push("/class/" + infoStart.value?.teacherClass.classId);
        return true;
      }
      return false;
    };

    const onClickClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      infoStart.value = { teacherClass, groupId };
      selectedGroupId.value = groupId;

      messageStartClass.value = "";
      if (!(await joinTheCurrentSession(groupId))) {
        await getListLessonByUnit(teacherClass, groupId);
        // startPopupVisible.value = true;
        deviceTesterRef.value?.showModal();
      }
    };

    const getListLessonByUnit = async (teacherClass: TeacherClassModel, groupId: string) => {
      try {
        loadingInfo.value = true;
        const response = await RemoteTeachingService.getListLessonByUnit(teacherClass.classId, groupId, -1);
        const listUnit: UnitAndLesson[] = [];

        if (response && response.success) {
          response.data.map((res: any) => {
            let isUnitExist = false;
            listUnit.map((singleUnit: UnitAndLesson) => {
              if (res.unitId == singleUnit.unit) {
                isUnitExist = true;
              }
            });
            if (!isUnitExist) {
              listUnit.push({ unit: res.unitId, sequence: [] });
            }
          });
          response.data.map((res: any) => {
            listUnit.map((singleUnit: UnitAndLesson, index) => {
              if (res.unitId == singleUnit.unit) {
                listUnit[index].sequence.push(res.sequence);
              }
            });
          });
        }
        listUnit.sort((a, b) => a.unit - b.unit);
        unitInfo.value = listUnit;
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          await store.dispatch("setToast", { message: message });
        }
      }
      loadingInfo.value = false;
    };

    const onStartClass = async (data: { unit: number; lesson: number }) => {
      popUpLoading.value = true;
      if (!(await joinTheCurrentSession(selectedGroupId.value))) {
        if (infoStart.value) {
          await startClass(infoStart.value.teacherClass, selectedGroupId.value, data.unit, data.lesson);
        }
      }
      popUpLoading.value = false;
    };

    const onCancelStartClass = async () => {
      startPopupVisible.value = false;
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
      window.addEventListener("keyup", escapeEvent);
    });

    onUnmounted(async () => {
      window.removeEventListener("keyup", escapeEvent);
    });

    const hasClassesShowUp = () => {
      if (loading.value == false) {
        return classesSchedules.value.length != 0;
      } else {
        return true;
      }
    };

    const hasClassesShowUpSchedule = () => {
      if (loading.value == false) {
        return classesSchedules.value.length != 0;
      } else return loading.value != true;
    };

    return {
      schools,
      //classes,
      classesSchedules,
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
      startPopupVisible,
      onStartClass,
      onCancelStartClass,
      infoStart,
      messageStartClass,
      popUpLoading,
      classOnline,
      unitInfo,
      loadingInfo,
      deviceTesterRef,
      welcomeText,
      scheduleText,
      cancelText,
      submitText,
    };
  },
});
