import { DeviceTesterLocale, ScheduleInfo, TeacherCalendarLocale } from "@/locales/localeid";
import { CalendarSchedulesModel, ClassGroupModel, SchedulesModel } from "@/models";
import { store } from "@/store";
import { ScheduleType } from "@/utils/utils";
import { All } from "@/views/teacher-calendar/teacher-calendar";
import { Button, Input, notification, Radio, Select, TimePicker } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, onMounted, ref } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useRoute } from "vue-router";
const formatDateTime = "YYYY-MM-DDTHH:mm:ss";
const MAX_HOUR_AVAILABLE = 12;
const MAX_MINUTES_AVAILABLE = 59;
enum HourType {
  AM = "AM",
  PM = "PM",
}
const formatDateTimeStandard = "YYYY-MM-DD";
const totalDayOfYear = 500;
const totalDayOfMonth = 31;
export default defineComponent({
  components: {
    Button,
    Input,
    Select,
    Option: Select.Option,
    RadioGroup: Radio.Group,
    RadioButton: Radio.Button,
    TimePicker,
  },
  setup() {
    const { dispatch, getters } = store;
    const route = useRoute();
    const classId = route.query.classId as string;
    const date = route.query.date as string;
    const classGroup = computed<Array<ClassGroupModel>>(() => store.getters["teacher/classGroup"]);
    const calendarSchedules = computed<Array<CalendarSchedulesModel>>(() => getters["teacher/calendarSchedules"]);
    const selectItem = computed(() => {
      const data = calendarSchedules.value
        .find((item: any) => moment(item.day).format(formatDateTimeStandard) === date)
        ?.schedules.filter((item) => (classId === All ? item : item.classId === classId));
      return data ?? [];
    });
    const currentClass = ref(classGroup.value.find((cl) => cl.classId === classId)?.classId ?? classGroup.value[0]?.classId ?? "");
    const currentGroup = ref(
      classGroup.value.find((cl) => cl.classId === classId)?.groups[0].groupId ?? classGroup.value[0]?.groups[0]?.groupId ?? "",
    );
    const currentClassName = ref(classGroup.value.find((cl) => cl.classId === classId)?.className ?? classGroup.value[0]?.className ?? "");
    const listClass = computed(() => (classId === All ? classGroup.value : classGroup.value.filter((cl) => cl.classId === classId)));
    const listGroupByClass = computed(() =>
      currentClass.value ? classGroup.value.find((cl) => cl.classId === currentClass.value)?.groups ?? [] : [],
    );
    const currentHour = ref(parseInt(moment().format("hh A").split(" ")[0]));
    const currentMinutes = ref(parseInt(moment().format("mm A").split(" ")[0]));
    const selectStartHour = ref(currentHour.value);
    const selectStartMinutes = ref(currentMinutes.value);
    const selectEndHour = ref(currentHour.value === 12 ? currentHour.value : currentHour.value + 1);
    const selectEndMinutes = ref(currentMinutes.value === MAX_MINUTES_AVAILABLE ? currentMinutes.value : currentMinutes.value);
    const startHourType = ref(moment().format("hh A").split(" ")[1]);
    const endHourType = ref(startHourType.value);
    const classText = computed(() => fmtMsg(TeacherCalendarLocale.ClassLabel));
    const groupText = computed(() => fmtMsg(TeacherCalendarLocale.GroupLabel));
    const startTimeText = computed(() => fmtMsg(TeacherCalendarLocale.StartTimeLabel));
    const endTimeText = computed(() => fmtMsg(TeacherCalendarLocale.EndTimeLabel));
    const deleteText = computed(() => fmtMsg(TeacherCalendarLocale.Delete));
    const skipText = computed(() => fmtMsg(TeacherCalendarLocale.Skip));
    const enterTimeText = computed(() => fmtMsg(ScheduleInfo.EnterTime));
    const addSessionText = computed(() => fmtMsg(ScheduleInfo.AddSession));
    const bottomNoteText = computed(() => fmtMsg(ScheduleInfo.BottomNote));
    const nonRecurringText = computed(() => fmtMsg(ScheduleInfo.NonRecurringNote));
    const hourText = computed(() => fmtMsg(ScheduleInfo.Hour));
    const minuteText = computed(() => fmtMsg(ScheduleInfo.Minute));
    const newSessionText = computed(() => fmtMsg(ScheduleInfo.NewSession));
    const RestoreText = computed(() => fmtMsg(ScheduleInfo.Restore));
    const AMText = computed(() => fmtMsg(ScheduleInfo.AM));
    const PMText = computed(() => fmtMsg(ScheduleInfo.PM));
    const CantCreateScheduleText = computed(() => fmtMsg(ScheduleInfo.CantCreateSchedule));
    const LessonText = computed(() => fmtMsg(DeviceTesterLocale.Lesson));
    const UnitText = computed(() => fmtMsg(DeviceTesterLocale.Unit));
    const dateTime = ref(moment(date).format("dddd, MMMM DD, yyyy"));

    const handleChangeClass = (value: string) => {
      currentClass.value = value;
      currentGroup.value = classGroup.value.find((cl) => cl.classId === value)?.groups[0].groupId ?? "";
    };
    const handleChangeGroup = (value: string) => {
      currentGroup.value = value;
    };
    const convertTime = (time: string) => {
      return moment(time, "h:mm A").format("HH:mm:ss");
    };
    const canCreateInCurrentDate = (vl: string) => {
      let result = false;
      const currentDate = moment(vl).year() * totalDayOfYear + (moment(vl).month() + 1) * totalDayOfMonth + moment(vl).date();
      classGroup.value.map((cl) => {
        if (currentClass.value == cl.classId) {
          const start = cl.startDate;
          const end = cl.endDate;
          let startDate = 0;
          let endDate = 0;
          if (start) {
            const startDateTotalValue = start.split("T")[0];
            const startDateSingleValue = startDateTotalValue.split("-");
            startDate =
              parseInt(startDateSingleValue[0]) * totalDayOfYear +
              parseInt(startDateSingleValue[1]) * totalDayOfMonth +
              parseInt(startDateSingleValue[2]);
          }
          if (end) {
            const endDateTotalValue = end.split("T")[0];
            const endDateSingleValue = endDateTotalValue.split("-");
            endDate =
              parseInt(endDateSingleValue[0]) * totalDayOfYear + parseInt(endDateSingleValue[1]) * totalDayOfMonth + parseInt(endDateSingleValue[2]);
          }
          if (endDate == 0 || (currentDate >= startDate && currentDate <= endDate)) {
            result = true;
          }
        }
      });
      return result;
    };
    const createSchedule = async () => {
      if (!canCreateInCurrentDate(date)) {
        notification.error({
          message: CantCreateScheduleText.value,
        });
        return;
      }
      const startTime = `${selectStartHour.value}:${selectStartMinutes.value} ${
        selectEndHour.value === MAX_HOUR_AVAILABLE ? (startHourType.value === HourType.AM ? HourType.PM : HourType.AM) : startHourType.value
      }`;
      const endTime = `${selectEndHour.value}:${selectEndMinutes.value} ${
        selectEndHour.value === MAX_HOUR_AVAILABLE ? (endHourType.value === HourType.AM ? HourType.PM : HourType.AM) : endHourType.value
      }`;
      const dataBack = {
        day: moment(date).format(formatDateTime),
        groupName: listGroupByClass.value.find((group) => group.groupId === currentGroup.value)?.groupName,
        className: classGroup.value.find((cl) => cl.classId === currentClass.value)?.className,
        data: {
          schoolClassId: currentClass.value,
          groupId: currentGroup.value,
          start: moment(date).format("YYYY-MM-DDT") + convertTime(startTime),
          end: moment(date).format("YYYY-MM-DDT") + convertTime(endTime),
          type: ScheduleType.Create,
        },
      };
      await dispatch("teacher/createSchedule", dataBack);
    };
    const deleteOrSkipSchedule = async (item: SchedulesModel) => {
      let dataBack = {};
      if (item.customizedScheduleId.includes("0000-")) {
        dataBack = {
          day: moment(date).format(formatDateTime),
          customId: item.customizedScheduleId,
          data: {
            schoolClassId: item.classId,
            groupId: item.groupId,
            timeId: item.timeId,
            start: moment(date).format(formatDateTimeStandard),
            end: moment(date).format(formatDateTimeStandard),
            type: ScheduleType.Skip,
          },
        };
        await dispatch("teacher/skipSchedule", dataBack);
      } else {
        dataBack = {
          day: moment(date).format(formatDateTime),
          data: { scheduleId: item.customizedScheduleId, customizedScheduleType: item.customizedScheduleType, type: ScheduleType.Delete },
        };
        await dispatch("teacher/deleteSchedule", dataBack);
      }
    };
    const onChangeHourStart = (value: number) => {
      selectStartHour.value = value;
      if (selectEndHour.value <= selectStartHour.value) {
        selectEndHour.value = value === MAX_HOUR_AVAILABLE ? MAX_HOUR_AVAILABLE : value + 1;
      }
    };
    const onChangeMinutesStart = (value: number) => {
      selectStartMinutes.value = value;
      if (value > selectEndMinutes.value && selectStartHour.value === selectEndHour.value) {
        if (selectStartHour.value === MAX_HOUR_AVAILABLE) {
          selectEndMinutes.value = value;
        } else {
          selectEndHour.value += 1;
        }
      }
    };
    const onChangeHourEnd = (value: number) => {
      selectEndHour.value = value;
    };
    const onChangeMinutesEnd = (value: number) => {
      selectEndMinutes.value = value;
    };
    const isDisableHour = (value: number) => {
      if (moment().format(formatDateTimeStandard) !== date) {
        return false;
      }
      if (value < selectStartHour.value) {
        return true;
      }
      return false;
    };
    const isDisableMinutes = (value: number) => {
      if (moment().format(formatDateTimeStandard) !== date) {
        return false;
      }
      if (value < selectStartMinutes.value) {
        return true;
      }
      return false;
    };
    const isDisableHourEnd = (value: number) => {
      if (value === selectStartHour.value) {
        return false;
      }
      if (value < selectEndHour.value) {
        return true;
      }
      return false;
    };
    const isDisableMinutesEnd = (value: number) => {
      if (selectStartHour.value < selectEndHour.value) {
        return false;
      }
      if (value < selectStartMinutes.value) {
        return true;
      }
      return false;
    };
    const onChangeStartHourType = (event: any) => {
      startHourType.value = event.target.value;
      if (startHourType.value === HourType.PM && endHourType.value === HourType.AM) {
        endHourType.value = HourType.PM;
      }
    };
    const onChangeEndHourType = (event: any) => {
      endHourType.value = event.target.value;
      if (endHourType.value === HourType.AM && startHourType.value === HourType.PM) {
        startHourType.value = HourType.AM;
      }
    };
    const disabledAddSessionBtn = computed(() => {
      if (
        (selectStartHour.value === selectEndHour.value && selectStartMinutes.value === selectEndMinutes.value) ||
        moment(date).isBefore(moment().format(formatDateTimeStandard))
      ) {
        return true;
      }
      return false;
    });
    const disabledSkipOrDeleteBtn = computed(() => {
      if (moment(date).isBefore(moment().format(formatDateTimeStandard))) {
        return true;
      }
      return false;
    });
    const actionText = (item: SchedulesModel) => {
      if (!item.customizedScheduleType) {
        if (item.customizedScheduleId.includes("0000-")) {
          return skipText.value;
        }
        return deleteText.value;
      } else {
        if (item.customizedScheduleType === ScheduleType.Cancelled) {
          return RestoreText.value;
        }
        return deleteText.value;
      }
    };
    const isRecurringSchedule = (item: SchedulesModel) => {
      return !item.customizedScheduleType || item.customizedScheduleType === ScheduleType.Cancelled;
    };
    const getScheduleUnitLesson = (item: SchedulesModel) => {
      const classInfo = classGroup.value.find((cl) => cl.classId === item.classId) ?? classGroup.value[0];
      return { unit: classInfo.unit, lesson: classInfo.lesson + 1 };
    };
    onMounted(async () => {
      if (!classGroup.value.length) {
        await store.dispatch("teacher/setClassGroup");
        currentClass.value = classGroup.value[0].classId;
        currentGroup.value = classGroup.value[0].groups[0].groupId;
      }
      if (!calendarSchedules.value.length) {
        await store.dispatch("teacher/loadAllSchedules", { startDate: moment(date).startOf("month").format(formatDateTime) });
      }
    });

    return {
      selectItem,
      classText,
      groupText,
      startTimeText,
      endTimeText,
      deleteText,
      skipText,
      enterTimeText,
      addSessionText,
      bottomNoteText,
      nonRecurringText,
      hourText,
      minuteText,
      newSessionText,
      RestoreText,
      AMText,
      PMText,
      LessonText,
      UnitText,
      listGroupByClass,
      currentClass,
      currentClassName,
      classGroup,
      moment,
      currentMinutes,
      startHourType,
      endHourType,
      selectEndHour,
      selectEndMinutes,
      HourType,
      ScheduleType,
      selectStartHour,
      selectStartMinutes,
      dateTime,
      handleChangeClass,
      handleChangeGroup,
      createSchedule,
      deleteOrSkipSchedule,
      onChangeHourStart,
      onChangeMinutesStart,
      isDisableHour,
      isDisableMinutes,
      isDisableHourEnd,
      isDisableMinutesEnd,
      onChangeHourEnd,
      onChangeMinutesEnd,
      onChangeStartHourType,
      onChangeEndHourType,
      disabledSkipOrDeleteBtn,
      disabledAddSessionBtn,
      listClass,
      actionText,
      isRecurringSchedule,
      getScheduleUnitLesson,
    };
  },
});
