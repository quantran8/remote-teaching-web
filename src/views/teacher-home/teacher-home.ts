import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { AccessibleSchoolQueryParam, RemoteTeachingService } from "@/services";
import { computed, defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
import { ResourceModel } from "@/models/resource.model";
import { Select, Spin } from "ant-design-vue";

export default defineComponent({
  components: {
    ClassCard,
    Select,
    Spin,
    Option: Select.Option,
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
    const haveClassActive = ref(false);
    const classActive = ref();

    const startClass = async (teacherClass: TeacherClassModel) => {
      try {
        // const lessons = await LessonService.getLessonByUnit(11);
        // let lesson = lessons.find((ele) => parseInt(ele.title) === 16);
        // if (!lesson) lesson = lessons[0];
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
          if (responseError && !responseError.success) {
            // console.log("ERROR", responseError.data.Message);
          }
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
      await store.dispatch("teacher/loadClasses", { schoolId: schoolId });
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

    const onClickClass = async (teacherClass: TeacherClassModel) => {
      if (teacherClass.isActive) {
        await router.push("/class/" + teacherClass.schoolClassId);
      } else {
        await startClass(teacherClass);
      }
    };

    const filterSchools = (input: string, option: any) => option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

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
    };
  },
});
