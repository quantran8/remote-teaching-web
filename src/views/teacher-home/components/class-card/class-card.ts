import { ClassCard, TeacherHome } from "@/locales/localeid";
import { UnitAndLesson } from "@/models";
import { GroupModelSchedules } from "@/models/group.model";
import { notification, Spin } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, onMounted, ref } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { getListUnitByClassAndGroup } from "../../lesson-helper";

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    remoteClassGroups: {
      type: Object as () => Array<GroupModelSchedules>,
      required: true,
    },
    isTeacher: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    loadingStart: {
      type: Boolean,
      default: false,
    },
    schoolId: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    unit: {
      type: Number,
      required: true,
    },
    lesson: {
      type: Number,
      required: true,
    },
  },
  components: {
    Spin,
  },
  emits: ["click-to-access"],
  setup: function (props, { emit }) {
    const groups = ref<GroupModelSchedules[]>();
    const clickedGroup = ref<string>("");
    const groupText = computed(() => fmtMsg(TeacherHome.Group));
    const nextText = computed(() => fmtMsg(TeacherHome.Next));
    const galleryText = computed(() => fmtMsg(TeacherHome.Gallery));
    const unitText = computed(() => fmtMsg(ClassCard.Unit));
    const lessonText = computed(() => fmtMsg(ClassCard.Lesson));
    const membersText = computed(() => fmtMsg(ClassCard.Members));
    const currentLesson = ref();
    const listLessonByUnit = ref();
    const unitInfo = ref<Array<UnitAndLesson>>([]);
    const loading = ref(false);

    const validatedGroupHighlighted = () => {
      let min = 999999;
      let indexMin = -1;
      let hasGroupActive = false;
      const current = new Date();
      const d = moment().month() * 31 + moment().date();
      const m = current.getMinutes();
      const h = current.getHours();
      const currentTime = d * 1440 + h * 60 + m;
      props.remoteClassGroups.map((group, index) => {
        const nextDay = { date: 0, start: "", end: "" };
        if (group.timeStart != null && group.timeEnd != null) {
          nextDay.start = group.timeStart.split("T")[1];
          nextDay.end = group.timeEnd.split("T")[1];
          const dateYear = group.timeStart.split("-")[0];
          nextDay.date = parseInt(dateYear[1]) * 31 + parseInt(dateYear[2]);
        }
        if (nextDay.start != null && nextDay.end != null) {
          const timeStart = nextDay.start.split(":");
          const timeEnd = nextDay.end.split(":");
          const timeStartValue = nextDay.date * 1440 + parseInt(timeStart[0], 10) * 60 + parseInt(timeStart[1], 10);
          const timeEndValue = nextDay.date * 1440 + parseInt(timeEnd[0], 10) * 60 + parseInt(timeEnd[1], 10);
          if (timeStartValue <= currentTime && currentTime <= timeEndValue) {
            hasGroupActive = true;
            group.isHighLighted = true;
          }
          const timeValue = timeStartValue;
          if (timeValue - currentTime > 0) {
            if (timeValue - currentTime < min) {
              min = timeValue - currentTime;
              indexMin = index;
            }
          } else if (timeValue + 10080 - currentTime < min) {
            min = timeValue - currentTime;
            indexMin = index;
          }
        }
      });
      if (!hasGroupActive) {
        props.remoteClassGroups.map((group, index) => {
          group.isHighLighted = indexMin == index;
        });
      }
    };

    const handleDateTime = (e: string) => {
      const index = e.search(" ");
      const subText = e.slice(0, index);
      const remainText = e.slice(index);
      const date = moment(`${moment().format("YYYY")}/${subText}`);
      return `${moment().format("YYYY")}/${subText} (${moment.weekdays(date.isoWeekday())}) |${remainText}`;
    };
    const setupUnitAndLesson = () => {
      const isUnitAvailable = unitInfo.value.find((item: UnitAndLesson) => item.unit === props.unit);
      const unitDefault = isUnitAvailable ? props.unit : unitInfo.value.length ? unitInfo.value[unitInfo.value.length - 1].unit : 1;
      const currentUnitIndex = unitInfo.value.findIndex((item: UnitAndLesson) => item.unit === unitDefault);
      listLessonByUnit.value = unitInfo.value[currentUnitIndex].sequence;
      currentLesson.value = listLessonByUnit.value[props.lesson];
    };
    const getListLessonByUnit = async (classId: string, groupId: string) => {
      try {
        unitInfo.value = await getListUnitByClassAndGroup(classId, groupId);
        return true;
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          notification.error({
            message: message,
          });
        }
        return false;
      }
    };
    onMounted(async () => {
      loading.value = true;
      if (props.remoteClassGroups) {
        validatedGroupHighlighted();
        const newGroups = props.remoteClassGroups.map((group) => {
          group.isCurrentDay = true;
          if (props.isTeacher === true) {
            group.startClass = true;
          }
          const nextDay = { date: "", time: "" };
          if (group.timeStart !== null) {
            if (group.timeStart.indexOf("T")) {
              const dateTime = group.timeStart.split("T");
              if (dateTime !== null) {
                if (dateTime[0] != null) {
                  nextDay.date = dateTime[0].split("-")[1] + "/" + dateTime[0].split("-")[2];
                }
                if (dateTime[1] != null) {
                  nextDay.time = dateTime[1].split(":")[0] + ":" + dateTime[1].split(":")[1];
                }
              }
            } else {
              nextDay.date = group.timeStart.split("-")[1] + "/" + group.timeStart.split("-")[2];
            }
          }
          if (nextDay != null) {
            group.next = `${nextDay.date} ${nextDay.time ? nextDay.time : ""}`;
          } else {
            group.next = "";
          }
          return group;
        });
        groups.value = newGroups;
      } else {
        groups.value = [];
      }
      const isSucceed = await getListLessonByUnit(props.id as string, props.remoteClassGroups[0].groupId as string);
      if (!isSucceed) {
        loading.value = false;
        return;
      }
      setupUnitAndLesson();
      loading.value = false;
    });

    const clickToAccess = (groupId: string, schoolId: string) => {
      clickedGroup.value = groupId;
      emit("click-to-access", groupId, schoolId);
    };

    return {
      groups,
      clickToAccess,
      clickedGroup,
      groupText,
      nextText,
      galleryText,
      unitText,
      lessonText,
      membersText,
      handleDateTime,
      currentLesson,
      loading,
    };
  },
});
