import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
import { ResourceModel } from "@/models/resource.model";
import { Select, Spin, Modal, Checkbox, Button, Row } from "ant-design-vue";
import { fmtMsg } from "@/commonui";
import { PrivacyPolicy } from "@/locales/localeid";

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
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const schools = computed<ResourceModel[]>(() => store.getters["teacher/schools"]);
    const classes = computed(() => store.getters["teacher/classes"]);
    const username = computed(() => store.getters["auth/username"]);
    const filteredSchools = ref<ResourceModel[]>(schools.value);
    const loading = ref<boolean>(false);
    const disabled = ref<boolean>(false);
    const haveClassActive = ref(false);
    const classActive = ref();
    const visible = ref<boolean>(true);
    const agreePolicy = ref<boolean>(false);
    const policyText1 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText1));
    const policyText2 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText2));
    const policyText3 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText3));
    const policyText4 = computed(() => fmtMsg(PrivacyPolicy.TeacherPolicyText4));
    const policy = computed(() => store.getters["teacher/acceptPolicy"]);
    const currentSchoolId = ref("");
    const startClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      try {
        const response = await RemoteTeachingService.teacherStartClassRoom(teacherClass.schoolClassId, groupId);
        if (response && response.success) {
          await router.push("/class/" + teacherClass.schoolClassId);
        }
      } catch (err) {
        if (err && err.body) {
          const responseError: {
            data: {
              Code: string;
              Message: string;
              Success: boolean;
            };
            success: boolean;
          } = err.body;
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
      await store.dispatch("teacher/loadClasses", { schoolId: schoolId });
      filteredSchools.value = schools.value;
      currentSchoolId.value = schoolId;
      loading.value = false;
    };

    const onClickClass = async (teacherClass: TeacherClassModel, groupId: string) => {
      if (teacherClass.isActive) {
        await router.push("/class/" + teacherClass.schoolClassId);
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
      await RemoteTeachingService.submitPolicy();
      await store.dispatch("teacher/setAcceptPolicy");
      await onSchoolChange(schools.value[0].id);
    };
    const cancelPolicy = () => {
      visible.value = false;
    };

    onMounted(async () => {
      const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
      if (loginInfo && loginInfo.loggedin) {
        await getSchools();
        if (schools.value?.length) {
          await onSchoolChange(schools.value[0].id);
          currentSchoolId.value = schools.value[0].id;
          if (schools.value.length === 1) {
            disabled.value = true;
          }
        }
      }
      if (classes.value) {
        classes.value.map((cl: TeacherClassModel) => {
          if (cl.isActive) {
            classActive.value = cl;
            haveClassActive.value = true;
          } else {
            haveClassActive.value = false;
          }
        });
      }
    });

    return {
      schools,
      classes,
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
    };
  },
});
