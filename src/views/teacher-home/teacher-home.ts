import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { AccessibleClassQueryParam, AccessibleSchoolQueryParam, LessonService, RemoteTeachingService } from "@/services";
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
import { ResourceModel } from "@/models/resource.model";
import { Select, Spin, Modal, Checkbox } from "ant-design-vue";
import { fmtMsg } from "@/commonui";
import {CommonLocale, PrivacyPolicy} from "@/locales/localeid";

export default defineComponent({
  components: {
    ClassCard,
    Select,
    Spin,
    Option: Select.Option,
    Modal,
    Checkbox,
  },
  async created() {
    const store = useStore();
    const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
    if (loginInfo && loginInfo.loggedin) {
      await store.dispatch("teacher/loadClasses", {
        teacherId: loginInfo.profile.sub,
      });
    }
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
    const visible = ref<boolean>(true);
    const agreePolicy = ref<boolean>(false);
    const accessDenied = fmtMsg(CommonLocale.CommonAccessDenied);
    const policyText1 = fmtMsg(PrivacyPolicy.TeacherPolicyText1);
    const policyText2 = fmtMsg(PrivacyPolicy.TeacherPolicyText2);
    const policyText3 = fmtMsg(PrivacyPolicy.TeacherPolicyText3);
    const policyText4 = fmtMsg(PrivacyPolicy.TeacherPolicyText4);

    const startClass = async (teacherClass: TeacherClassModel) => {
      try {
        const response = await RemoteTeachingService.teacherStartClassRoom(teacherClass.schoolClassId, teacherClass.schoolClassId);
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
      await store.dispatch("teacher/loadAccessibleClasses", {
        schoolId,
        disabled: false,
        isDetail: false,
        isCampusDetail: false,
      } as AccessibleClassQueryParam);
      filteredSchools.value = schools.value;
      loading.value = false;
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
    });

    const onClickClass = async (teacherClass: TeacherClassModel) => {
      if (teacherClass.isActive) {
        await router.push("/class/" + teacherClass.schoolClassId);
      } else {
        await startClass(teacherClass);
      }
    };

    const filterSchools = (input: string, option: any) => option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

    const onAgreePolicy = () => {
      agreePolicy.value = !agreePolicy.value;
      console.error(agreePolicy.value, "aaaaaaaaaaaaaaaa");
    };
    const submitPolicy = () => {
      console.log("submit modal");
      visible.value = false;
    };

    return {
      schools,
      classes,
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
      accessDenied,
    };
  },
});
