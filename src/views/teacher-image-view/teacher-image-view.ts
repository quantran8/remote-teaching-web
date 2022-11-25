import { WriterReview } from "@/locales/localeid";
import { RoomModel, TeacherClassModel } from "@/models";
import { AccessibleSchoolQueryParam } from "@/services";
import { BlobTagItem } from "@/services/storage/interface";
import { StudentsGroup } from "@/store/teacher/state";
import { FilterMode } from "@/utils/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button, Calendar, DatePicker, Input, Modal, notification, Popconfirm, Radio, Select, Table } from "ant-design-vue";
import { RadioChangeEvent } from "ant-design-vue/lib/radio";
import { Moment } from "moment";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, defineComponent, onMounted, ref } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const fpPromise = FingerprintJS.load();
interface Value {
  value: string;
  label: string;
  key?: string;
}
export default defineComponent({
  components: {
    Radio,
    RadioGroup: Radio.Group,
    Select,
    Option: Select.Option,
    Button,
    Calendar,
    Input,
    Table,
    Modal,
    Swiper,
    SwiperSlide,
    DatePicker,
    Popconfirm,
  },
  setup() {
    const { getters, dispatch } = useStore();
    const { schoolId, studentId } = useRoute().params;
    const noClassOrGroupText = computed(() => fmtMsg(WriterReview.NoClassOrGroup));
    const noStudentText = computed(() => fmtMsg(WriterReview.NoStudent));
    const classesSchedules = computed<Array<TeacherClassModel>>(() => getters["teacher/classesSchedules"]);
    const classesSchedulesBySchools = computed<Array<TeacherClassModel>>(() => getters["teacher/classesSchedulesBySchools"]);
    const schools = computed(() => getters["teacher/schools"]);
    const studentsGroup = computed<Array<StudentsGroup>>(() => getters["teacher/currentStudentsGroup"]);
    const classInfo = computed<RoomModel>(() => getters["teacherRoom/info"]);
    const userInfo = computed(() => getters["auth/getLoginInfo"]);
    const studentsImageCaptured = computed<Array<BlobTagItem>>(() => getters["teacherRoom/studentsImageCaptured"]);
    const visitorId = ref("");
    const sessionFilter = ref({
      schoolId: "",
      classId: "",
      groupId: "",
    });
    const studentFilter = ref({
      classId: "",
      groupId: "",
      studentId: "",
    });
    const listDateByStudent = computed(() => {
      const listDate: Array<string> = [];
      studentsImageCaptured.value
        .filter((blob) => blob.tags.studentId === studentSelected.value.value)
        ?.forEach((item) => {
          if (!listDate.includes(item.tags.dateTime)) {
            listDate.push(item.tags.dateTime);
          }
        });
      return listDate;
    });
    const schoolOptions = computed<Array<Value>>(() => schools.value?.map((school: any) => ({ value: school.id, label: school.name })) ?? []);
    const classOptions = computed<Array<Value>>(() => {
      if (filterMode.value === FilterMode.Student) {
        return classesSchedulesBySchools.value?.map((c: any) => ({ value: c.classId, label: c.className })) ?? [];
      }
      return classesSchedules.value?.map((c: any) => ({ value: c.classId, label: c.className })) ?? [];
    });
    const studentOptions = computed<Array<Value>>(() => {
      return studentsGroup.value?.map((student) => ({ value: student.studentId, label: student.studentName })) ?? [];
    });
    const groupOptions = computed<Array<Value>>(() => {
      if (filterMode.value === FilterMode.Student) {
        return (
          classesSchedulesBySchools.value
            .find((c) => c.classId === classSelected.value.value)
            ?.groups.map((group) => ({
              value: group.groupId,
              label: `${group.groupName} ${
                filterMode.value === FilterMode.Student ? "" : "(" + classesSchedulesBySchools.value[0]?.className + ")" ?? ""
              }`,
            })) ?? []
        );
      }
      const groups: any[] = [];
      classesSchedules.value.forEach((c) => {
        c.groups.forEach((group) => {
          groups.push({
            value: group.groupId,
            label: `${group.groupName} ${"(" + c.className + ")" ?? ""}`,
          });
        });
      });
      return groups;
    });
    const classSelected = computed(() => {
      if (filterMode.value === FilterMode.Student) {
        if (studentFilter.value.classId) {
          return {
            value: studentFilter.value.classId,
          };
        }
        if (classOptions.value.length) {
          return {
            value: classOptions.value[0].value,
          };
        }
        return {
          value: "",
        };
      }
      if (sessionFilter.value.classId) {
        return {
          value: sessionFilter.value.classId,
        };
      }
      if (classOptions.value.length) {
        return {
          value: classOptions.value[0].value,
        };
      }
      return {
        value: "",
      };
    });
    const schoolSelected = computed(() => {
      if (sessionFilter.value.schoolId) {
        return {
          value: sessionFilter.value.schoolId,
        };
      }
      if (schoolOptions.value.length) {
        return {
          value: schoolOptions.value[0].value,
        };
      }
      return {
        value: "",
      };
    });
    const groupSelected = computed(() => {
      if (filterMode.value === FilterMode.Student) {
        if (studentFilter.value.groupId) {
          return {
            value: studentFilter.value.groupId,
          };
        }
        return {
          value: groupOptions.value[0]?.value,
        };
      }
      if (sessionFilter.value.groupId) {
        return {
          value: sessionFilter.value.groupId,
        };
      }
      if (groupOptions.value.length) {
        return {
          value: groupOptions.value[0].value,
        };
      }
      return {
        value: "",
      };
    });
    const studentSelected = computed(() => {
      if (filterMode.value === FilterMode.Student) {
        if (studentFilter.value.studentId) {
          return {
            value: studentFilter.value.studentId,
          };
        }
        if (studentOptions.value.length) {
          return {
            value: studentOptions.value[0].value,
          };
        }
        return {
          value: "",
        };
      }
      return {
        value: "",
      };
    });
    const studentCount = computed(() => {
      if (filterMode.value === FilterMode.Session) {
        return (
          classesSchedules.value
            .find((c) => c.classId === classSelected.value.value)
            ?.groups.find((group) => group.groupId === groupSelected.value.value)?.studentCount ?? 0
        );
      }
      return (
        classesSchedulesBySchools.value
          .find((c) => c.classId === classSelected.value.value)
          ?.groups.find((group) => group.groupId === groupSelected.value.value)?.studentCount ?? 0
      );
    });
    const modules = [Pagination, Navigation];
    const currentDate = ref("");
    const calendarValue = ref<Moment>();
    const isShowCalendar = ref(false);
    const isShowImageModal = ref(false);
    const filterMode = ref(FilterMode.Student);
    const filterOptions = ref({
      filterMode: filterMode.value,
      school: "",
      class: "",
      group: "",
      student: "",
      date: "",
    });
    const carouselDataSource = ref<Array<BlobTagItem>>([]);
    const columns = computed(() => [
      {
        title: filterMode.value === FilterMode.Student ? "Session" : "Student",
        dataIndex: filterMode.value === FilterMode.Student ? "session" : "student",
        key: filterMode.value === FilterMode.Student ? "session" : "student",
      },
      {
        title: "Count",
        dataIndex: "count",
        key: "count",
        slots: { customRender: "count" },
      },
    ]);
    const tableDataSources = computed(() => {
      if (filterMode.value === FilterMode.Student) {
        return listDateByStudent.value.map((date: string) => ({
          key: date,
          session: date,
          count: studentsImageCaptured.value.filter((item) => item.tags.dateTime === date && item.tags.studentId === studentSelected.value.value)
            .length,
        }));
      }
      return studentsGroup.value.map((student) => ({
        key: student.studentId,
        student: student.nativeName,
        count: currentDate.value
          ? studentsImageCaptured.value.filter((item) => item.tags.studentId === student.studentId && item.tags.dateTime === currentDate.value).length
          : studentsImageCaptured.value.filter((item) => item.tags.studentId === student.studentId).length,
      }));
    });
    const getStorageImages = async () => {
      await dispatch("teacherRoom/getStudentCapturedImages", {
        token: userInfo.value.access_token,
        schoolId: schoolSelected.value.value,
        classId: classSelected.value.value,
        groupId: groupSelected.value.value,
        studentId: studentSelected.value.value,
        date: "",
        filterMode: filterMode.value,
      });
    };

    const handleChangeRadioSelected = async (e: RadioChangeEvent) => {
      await dispatch("teacher/setCurrentGroupStudents", []);
      filterMode.value = e.target.value;
      if (studentCount.value) {
        await dispatch("teacher/getClassInfo", {
          classId: classSelected.value.value,
          groupId: groupSelected.value.value,
          teacherId: userInfo.value.profile.sub,
        });
        await getStorageImages();
        return;
      }
      cleanUpStudentsGroupAndNotify(filterMode.value === FilterMode.Session ? noClassOrGroupText.value : noStudentText.value);
    };
    const handleChangeClass = async (value: Value) => {
      studentFilter.value.classId = value.value;
      studentFilter.value.groupId = groupOptions.value.length ? groupOptions.value[0].value : "";
      if (studentCount.value) {
        await dispatch("teacher/getClassInfo", {
          classId: value.value,
          groupId: groupSelected.value.value,
          teacherId: userInfo.value.profile.sub,
        });
        studentFilter.value.studentId = studentOptions.value[0].value;
        filterOptions.value.student = studentOptions.value[0]?.value ?? "";
        await getStorageImages();
      } else {
        studentFilter.value.groupId = "";
        studentFilter.value.studentId = "";
        cleanUpStudentsGroupAndNotify(noStudentText.value);
      }
    };
    const handleChangeGroup = async (value: Value) => {
      if (filterMode.value === FilterMode.Student) {
        studentFilter.value.groupId = value.value;
        if (studentCount.value) {
          await dispatch("teacher/getClassInfo", {
            classId: studentFilter.value.classId,
            groupId: value.value,
            teacherId: userInfo.value.profile.sub,
          });
          studentFilter.value.studentId = studentOptions.value.length ? studentOptions.value[0].value : "";
          await getStorageImages();
          return;
        }
        cleanUpStudentsGroupAndNotify(noStudentText.value);
        studentFilter.value.studentId = "";
      } else {
        sessionFilter.value.classId =
          classesSchedules.value.find((c) => {
            return c.groups.find((group) => group.groupId === value.value) ? c : undefined;
          })?.classId ?? "";
        sessionFilter.value.groupId = value.value;
        if (studentCount.value) {
          await dispatch("teacher/getClassInfo", {
            classId: sessionFilter.value.classId,
            groupId: value.value,
            teacherId: userInfo.value.profile.sub,
          });
          await getStorageImages();
          return;
        }
        cleanUpStudentsGroupAndNotify(noStudentText.value);
      }
    };
    const handleChangeStudent = async (value: Value) => {
      studentFilter.value.studentId = value.value;
      await getStorageImages();
    };
    const handleChangeSchool = async (value: Value) => {
      await dispatch("teacher/loadAllClassesSchedules", {
        schoolId: value.value,
        browserFingerPrinting: visitorId.value,
      });
      sessionFilter.value.schoolId = value.value;
      sessionFilter.value.classId = classOptions.value[0]?.value;
      sessionFilter.value.groupId = groupOptions.value[0]?.value;
      if (classOptions.value.length && groupOptions.value.length) {
        if (studentCount.value) {
          await dispatch("teacher/getClassInfo", {
            classId: classOptions.value[0]?.value,
            groupId: groupOptions.value[0]?.value,
            teacherId: userInfo.value.profile.sub,
          });
          await getStorageImages();
        } else {
          await cleanUpStudentsGroupAndNotify(noStudentText.value);
        }
      } else {
        sessionFilter.value.classId = "";
        sessionFilter.value.groupId = "";
        await cleanUpStudentsGroupAndNotify(noClassOrGroupText.value);
      }
    };
    const handleChangeDate = (value: Moment) => {
      if (!value) {
        currentDate.value = "";
        return;
      }
      isShowCalendar.value = false;
      currentDate.value = value.format("yyyy-MM-DD");
    };
    const handleShowImage = (value: any) => {
      isShowImageModal.value = !isShowImageModal.value;
      carouselDataSource.value = studentsImageCaptured.value.filter((item) => {
        if (filterMode.value === FilterMode.Student) {
          return item.tags.dateTime === value.key;
        }
        if (currentDate.value) {
          return (
            item.tags.dateTime === currentDate.value &&
            item.tags.schoolId === schoolSelected.value.value &&
            item.tags.groupId === groupSelected.value.value &&
            item.tags.studentId === value.key
          );
        }
        return (
          item.tags.schoolId === schoolSelected.value.value && item.tags.groupId === groupSelected.value.value && item.tags.studentId === value.key
        );
      });
    };
    const removeImage = async (imageName: string) => {
      const data = studentsImageCaptured.value.filter((item) => item.blobName !== imageName);
      carouselDataSource.value = carouselDataSource.value.filter((item) => item.blobName !== imageName);
      await dispatch("teacherRoom/setStudentsImageCaptured", data);
      await dispatch("teacherRoom/removeStudentImage", {
        token: userInfo.value.access_token,
        fileName: imageName,
      });
    };
    const blobNameToUrl = (blobName: string) => {
      return process.env.VUE_APP_STORAGE_URL + blobName;
    };
    const cleanUpStudentsGroupAndNotify = async (message: string) => {
      await dispatch("teacher/setCurrentGroupStudents", []);
      notification.error({
        message,
      });
    };

    onMounted(async () => {
      const fp = await fpPromise;
      const result = await fp.get();
      visitorId.value = result.visitorId;
      await dispatch("teacher/loadAccessibleSchools", {
        disabled: false,
      } as AccessibleSchoolQueryParam);
      await dispatch("teacher/setClassesSchedulesBySchools", null);
      const classId = classesSchedulesBySchools.value.find((c) => c.schoolId === schoolId)?.classId;
      if (classId) {
        studentFilter.value.classId = classId;
      } else {
        studentFilter.value.classId = classOptions.value.length ? classOptions.value[0].value : "";
      }
      sessionFilter.value.schoolId = schoolId as string;
      await dispatch("teacher/loadAllClassesSchedules", {
        schoolId: schoolId,
        browserFingerPrinting: visitorId.value,
      });
      if (studentId) {
        studentFilter.value.studentId = studentId as string;
        studentFilter.value.groupId = classInfo.value.classInfo.groupId;
      }
      if (studentCount.value) {
        await dispatch("teacher/getClassInfo", {
          classId: classSelected.value?.value,
          groupId: studentId
            ? groupOptions.value?.find((item) => item.value === classInfo.value?.classInfo.groupId)?.value ?? ""
            : groupOptions.value[0]?.value,
          teacherId: userInfo.value.profile.sub,
        });
        await getStorageImages();
      } else {
        cleanUpStudentsGroupAndNotify(noStudentText.value);
      }
    });
    return {
      filterMode,
      schools,
      classesSchedules,
      currentDate,
      schoolOptions,
      classOptions,
      groupOptions,
      studentOptions,
      isShowCalendar,
      columns,
      tableDataSources,
      isShowImageModal,
      filterOptions,
      classSelected,
      groupSelected,
      studentSelected,
      carouselDataSource,
      FilterMode,
      modules,
      calendarValue,
      schoolSelected,
      removeImage,
      handleChangeDate,
      handleChangeRadioSelected,
      handleChangeClass,
      handleChangeGroup,
      handleChangeStudent,
      handleChangeSchool,
      handleShowImage,
      blobNameToUrl,
      getStorageImages,
    };
  },
});
