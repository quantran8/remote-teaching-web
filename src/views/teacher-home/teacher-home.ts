import { DeviceTester } from "@/components/common";
import { CommonLocale, PrivacyPolicy } from "@/locales/localeid";
import { ClassModelSchedules, ClassRoomStatus, TeacherClassModel, UnitAndLesson } from "@/models";
import { JoinSessionModel } from "@/models/join-session.model";
import { ResourceModel } from "@/models/resource.model";
import { AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import { AppView, VCPlatform } from "@/store/app/state";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button, Checkbox, Empty, Modal, notification, Row, Select, Spin } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { fmtMsg, LoginInfo, MatIcon } from "vue-glcommonui";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { TeacherHome } from "./../../locales/localeid";
import ClassCard from "./components/class-card/class-card.vue";
import { getListUnitByClassAndGroup } from "./lesson-helper";

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
    MatIcon,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const schools = computed<ResourceModel[]>(() => store.getters["teacher/schools"]);
    //const classes = computed(() => store.getters["teacher/classes"]);
    const classesSchedules = computed(() => store.getters["teacher/classesSchedules"]);
    const classOnline = computed(() => store.getters["teacher/getClassOnline"]);
    const username = computed(() => store.getters["auth/username"]);
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
    const homeText = computed(() => fmtMsg(TeacherHome.Home));
    const galleryText = computed(() => fmtMsg(TeacherHome.Gallery));
    const policy = computed(() => store.getters["teacher/acceptPolicy"]);
    const classesSchedulesAllSchool = computed<ClassModelSchedules[]>(() => store.getters["teacher/classesSchedulesAllSchool"]);
    const currentSchoolId = ref("");
    const concurrent = ref<boolean>(false);
    const concurrentMess = ref("");
    const loadingStartClass = ref<boolean>(true);
    const unitInfo = ref<UnitAndLesson[]>();
    const loadingInfo = ref(false);
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const selectedGroupId = ref();
    const currentSchool = computed(() => store.getters["teacher/currentSchoolId"]);
    // const moment = require("moment");
    const now = ref(`${moment().format("dddd, MMMM DD, yyyy")}`);
    const isThreeGroup = computed(() => {
      const isThree = classesSchedulesAllSchool.value.find((item) => item.groups.length > 2);
      return isThree;
    });
    const schoolIds = computed(() => {
      const schools: string[] = [];
      classesSchedulesAllSchool.value.forEach((item) => {
        if (item.schoolId && !schools.includes(item.schoolId) && item.groups && item.groups.length) {
          schools.push(item.schoolId);
        }
      });
      return schools;
    });
    const hasClassesShowUp = computed(() => {
      if (loading.value) {
        return true;
      } else {
        return classesSchedulesAllSchool.value.length;
      }
    });
    const getCampusBySchoolId = (id: string) => {
      const data = classesSchedulesAllSchool.value.filter((item) => item.schoolId === id);
      const campus: string[] = [];
      data.forEach((item) => {
        if (!campus.includes(item.campusId)) {
          campus.push(item.campusId);
        }
      });
      return campus;
    };
    const getDataByCampus = (id: string) => {
      return classesSchedulesAllSchool.value.filter((item) => item.campusId === id);
    };
    const getSchoolNameBySchoolId = (id: string) => {
      const data = classesSchedulesAllSchool.value.find((item) => item.schoolId === id);
      return data?.schoolName;
    };
    const getCampusNameByCampusId = (id: string) => {
      const data = classesSchedulesAllSchool.value.find((item) => item.campusId === id);
      return data?.campusName;
    };

    const startClass = async (
      teacherClass: TeacherClassModel,
      groupId: string,
      unit: number,
      lesson: number,
      unitId: number,
      isTeacherVideoMirror = true,
      isStudentVideoMirror = true,
    ) => {
      messageStartClass.value = "";
      try {
        const fp = await fpPromise;
        const result = await fp.get();
        const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
        const model: JoinSessionModel = {
          classId: teacherClass.classId,
          groupId: groupId,
          resolution,
          unit: unit,
          lesson: lesson,
          browserFingerprint: result.visitorId,
          unitId,
          videoPlatformProvider: VCPlatform.Agora,
          isTeacherVideoMirror,
          isStudentVideoMirror,
        };
        const response = await RemoteTeachingService.teacherStartClassRoom(model);
        if (response && response.success) {
          deviceTesterRef.value?.handleGoToClassSuccess();
          await store.dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
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
      await router.push("/teacher-calendars");
    };

    const onClickHome = async () => {
      await router.push("/");
    };
    const getSchools = async () => {
      await store.dispatch("teacher/loadAccessibleSchools", {
        disabled: false,
      } as AccessibleSchoolQueryParam);
    };

    const onSchoolChange = async (schoolId: string) => {
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        await store.dispatch("teacher/loadAllClassesSchedules", {
          schoolId: schoolId,
          browserFingerPrinting: visitorId,
        });
        currentSchoolId.value = schoolId;
        await store.dispatch("teacher/setCurrentSchool", schoolId);
      } catch (err) {
        // concurrent.value = true;
        // concurrentMess.value = err.body.message;
        if (err.body.message) {
          notification.error({
            message: err.body.message,
          });
        }
      }
    };

    const joinTheCurrentSession = async (currentGroupId: string) => {
      if (classOnline.value && currentGroupId == classOnline.value.groupId) {
        await router.push("/class/" + classOnline.value.classId);
        return true;
      }
      return false;
    };

    const onClickClass = async (teacherClass: TeacherClassModel, groupId: string, schoolId: string) => {
      await onSchoolChange(schoolId);
      messageStartClass.value = "";
      if (!(await joinTheCurrentSession(groupId))) {
        const schoolName = schools.value.find((school) => school.id === teacherClass.schoolId)?.name;
        const groupName = teacherClass.groups.find((group) => group.groupId === groupId)?.groupName;
        if (schoolName && groupName) {
          router.push({
            path: "/class-setup/teacher",
            query: {
              schoolName,
              campusName: teacherClass.campusName,
              classId: teacherClass.classId,
              className: teacherClass.className,
              groupId: groupId,
              groupName,
              studentId: "",
              unit: teacherClass.unit,
              lesson: teacherClass.lessonNumber,
            },
          });
        }
      }
    };

    const rejoinClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      messageStartClass.value = "";
      if (!(await joinTheCurrentSession(groupId))) {
        const schoolName = schools.value.find((school) => school.id === teacherClass.schoolId)?.name;
        const groupName = teacherClass.groups.find((group) => group.groupId === groupId)?.groupName;
        if (schoolName && groupName) {
          router.push({
            path: "/class-setup/teacher",
            query: {
              schoolName,
              campusName: teacherClass.campusName,
              classId: teacherClass.classId,
              className: teacherClass.className,
              groupId: groupId,
              groupName,
              studentId: "",
            },
          });
        }
      }
    };

    const getListLessonByUnit = async (teacherClass: TeacherClassModel, groupId: string) => {
      try {
        loadingInfo.value = true;
        unitInfo.value = await getListUnitByClassAndGroup(teacherClass.classId, groupId);
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          notification.error({
            message: message,
          });
        }
      }
      loadingInfo.value = false;
    };

    const onStartClass = async (data: {
      unitId: number;
      lesson: number;
      unit: number;
      isTeacherVideoMirror: boolean;
      isStudentVideoMirror: boolean;
    }) => {
      popUpLoading.value = true;
      if (!(await joinTheCurrentSession(selectedGroupId.value))) {
        if (infoStart.value) {
          await startClass(
            infoStart.value.teacherClass,
            selectedGroupId.value,
            data.unit,
            data.lesson,
            data.unitId,
            data.isTeacherVideoMirror,
            data.isStudentVideoMirror,
          );
        }
      }
      popUpLoading.value = false;
    };

    const onCancelStartClass = async () => {
      startPopupVisible.value = false;
    };

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
      const loginInfo: LoginInfo = store.getters["auth/getLoginInfo"];
      if (loginInfo && loginInfo.loggedin) {
        loading.value = true;
        await getSchools();
        if (schools.value?.length) {
          await store.dispatch("teacher/loadAllClassesSchedulesAllSchool");
          await onSchoolChange(schools.value[0].id);
        }
        loading.value = false;
      }
      await store.dispatch("teacher/clearSchedules");
      window.addEventListener("keyup", escapeEvent);
    });

    onUnmounted(async () => {
      await store.dispatch("teacher/clearAllClassesSchedulesAllSchool");
      window.removeEventListener("keyup", escapeEvent);
    });

    return {
      schools,
      //classes,
      classesSchedules,
      username,
      onClickClass,
      rejoinClass,
      onSchoolChange,
      loading,
      disabled,
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
      onClickHome,
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
      homeText,
      galleryText,
      cancelText,
      submitText,
      currentSchool,
      now,
      isThreeGroup,
      schoolIds,
      getCampusBySchoolId,
      getDataByCampus,
      getSchoolNameBySchoolId,
      getCampusNameByCampusId,
    };
  },
});
