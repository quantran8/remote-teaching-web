import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { Button, Calendar, Col, Modal, Row, Select, Spin, TimePicker, Tooltip } from "ant-design-vue";
import { PlusCircleOutlined } from "@ant-design/icons-vue";
import moment, { Moment } from "moment";
import { useStore } from "vuex";
import { ClassModelSchedules } from "@/models";
import {useRoute, useRouter} from "vue-router";
import { ScheduleParam } from "@/services";
import { fmtMsg, LoginInfo } from "vue-glcommonui";
import IconWarning from "@/assets/calendar-warning.svg";
import { CommonLocale, TeacherCalendarLocale } from "@/locales/localeid";

export default defineComponent({
  components: {
    Select,
    Spin,
    Option: Select.Option,
    Modal,
    Button,
    Row,
    Calendar,
    Col,
    TimePicker,
    Tooltip,
    PlusCircleOutlined,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { schoolId } = route.params;
    const loginInfo: LoginInfo = store.getters["auth/getLoginInfo"];
    const visible = ref<boolean>(false);
    const recurringVisible = ref<boolean>(false);
    const listClassSelect = ref<any[]>([]);
    const listClassCreateNew = ref<any[]>([]);
    const listGroupSelect = ref<any[]>([]);
    const listGroupModal = ref<any[]>([]);
    const selectedClassId = ref<string>("all");
    const selectedClassIdModal = ref<string>("");
    const selectedGroupId = ref<string>("all");
    const selectedGroupIdCache = ref<string>("all");
    const selectedGroupIdModal = ref<string>("");
    const selectedTimeIdModal = ref<string>("");
    const selectedStartDateModal = ref<string>("");
    const selectedEndDateModal = ref<string>("");
    const selectedCustomScheduleId = ref<string>("");
    const selectedDate = ref<Moment>(moment().startOf("day"));
    const isDisableGroup = ref<boolean>(true);
    const calendarSchedules = computed(() => store.getters["teacher/calendarSchedules"]);
    const color = ref();
    const month = ref<Moment>(moment());
    const formatTime = "HH:mm";
    const formatDateTime = "YYYY-MM-DDTHH:mm:ss";
    const filterAll = "all";
    const totalColor = 10;
    const totalDayOfYear = 500;
    const totalDayOfMonth = 31;
    const isCreate = ref<boolean>(false);
    const classesSchedules = computed(() => store.getters["teacher/classesSchedules"]);
    const recurringCustomIdFistFormat = "0000-";
    const loading = ref(false);
    const isActionUpdate = ref(false);
    const cacheMinutesEnd = ref<number>(0);
    const cacheHoursEnd = ref<number>(0);
    const cacheMinutesStart = ref<number>(0);
    const cacheHoursStart = ref<number>(0);
    const warningOverlap = computed(() => fmtMsg(CommonLocale.OverlapWarningSession));
    const titleText = computed(() => fmtMsg(TeacherCalendarLocale.Title));
    const classText = computed(() => fmtMsg(TeacherCalendarLocale.ClassLabel));
    const groupText = computed(() => fmtMsg(TeacherCalendarLocale.GroupLabel));
    const startTimeText = computed(() => fmtMsg(TeacherCalendarLocale.StartTimeLabel));
    const endTimeText = computed(() => fmtMsg(TeacherCalendarLocale.EndTimeLabel));
    const deleteText = computed(() => fmtMsg(TeacherCalendarLocale.Delete));
    const cancelText = computed(() => fmtMsg(TeacherCalendarLocale.Cancel));
    const saveText = computed(() => fmtMsg(TeacherCalendarLocale.Save));
    const skipText = computed(() => fmtMsg(TeacherCalendarLocale.Skip));
    const closeText = computed(() => fmtMsg(TeacherCalendarLocale.Close));
    const noteText = computed(() => fmtMsg(TeacherCalendarLocale.Note));
    const schoolText = computed(() => fmtMsg(TeacherCalendarLocale.School));
    const allText = computed(() => fmtMsg(TeacherCalendarLocale.All));

    const getClassBySchoolId = async (schoolId: any) => {
      await store.dispatch("teacher/loadAllClassesSchedules", { schoolId: schoolId });
    };

    onMounted(async () => {
      await getClassBySchoolId(schoolId);
      await getListClassSelect(classesSchedules.value);
      await getSchedules(null, null, month.value);
    });

    watch(month, () => {
      const classId = selectedClassId.value == "all" ? null : selectedClassId.value;
      const groupId = selectedGroupId.value == "all" ? null : selectedGroupId.value;
      getSchedules(classId, groupId, month.value);
    });

    const getSchedules = async (classId: any, groupId: any, month: Moment) => {
      loading.value = true;
      await store.dispatch("teacher/loadSchedules", {
        schoolId,
        classId,
        groupId,
        startDate: month.startOf("month").format(formatDateTime),
        endDate: month.endOf("month").format(formatDateTime),
      });
      loading.value = false;
    };

    const getListClassSelect = async (listClass: ClassModelSchedules[]) => {
      const listClassFilter = listClass
        .map((cl: any) => {
          let listGroup = [];
          listGroup = cl.groups.map((group: any) => {
            return { id: group.groupId, name: group.groupName };
          });
          if (listGroup.length > 0) {
            return { id: cl.classId, name: cl.className, startDate: cl.startDate, endDate: cl.endDate, groups: listGroup };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let colorIndex = 0;
      color.value = listClassFilter
        .map((cl: any) => {
          return cl.id;
        })
        .reduce((hash: any, elem: any) => {
          hash[elem] = getRandomColor(colorIndex);
          colorIndex++;
          if (colorIndex == totalColor) {
            colorIndex = 0;
          }
          return hash;
        }, {});
      listClassSelect.value = listClassFilter;
    };

    const getGroupsByClass = async (classId: string) => {
      const currentClass = listClassSelect.value.filter((cl: any) => {
        return cl.id == classId;
      })[0];
      listGroupSelect.value = currentClass.groups;
    };

    const getGroupsModalByClass = async (classId: string) => {
      const currentClass = listClassCreateNew.value.filter((cl: any) => {
        return cl.id == classId;
      })[0];
      listGroupModal.value = currentClass.groups;
      selectedGroupIdModal.value = currentClass.groups.length > 0 ? currentClass.groups[0].id : "";
    };

    const handleChangeClass = async (vl: string) => {
      selectedClassId.value = vl;
      selectedGroupIdCache.value = filterAll;
      if (vl != "all") {
        await getSchedules(vl, null, month.value);
        await getGroupsByClass(vl);
        isDisableGroup.value = false;
      } else {
        await getSchedules(null, null, month.value);
        isDisableGroup.value = true;
      }
      selectedGroupId.value = "all";
    };

    const handleChangeGroup = async (vl: string) => {
      selectedGroupId.value = vl;
      selectedGroupIdCache.value = vl;
      if (vl != "all") {
        await getSchedules(selectedClassId.value, vl, month.value);
      } else {
        await getSchedules(selectedClassId.value, null, month.value);
      }
    };

    const handleChangeTimeModal = (groupId: string) => {
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == selectedDate.value.date() && moment(daySchedule.day).month() == selectedDate.value.month();
      });
      if (listData[0]) {
        const group = listData[0].schedules.filter((schedule: any) => {
          return schedule.groupId == groupId;
        });
        selectedStartDateModal.value = !isCreate.value ? group[0].start : "00:00";
        selectedEndDateModal.value = !isCreate.value ? group[0].end : "00:00";
      }
    };

    const handleChangeClassModal = (vl: string) => {
      selectedClassIdModal.value = vl;
      getGroupsModalByClass(vl);
    };

    const handleChangeGroupModal = (vl: string) => {
      selectedGroupIdModal.value = vl;
      if (!isActionUpdate.value) handleChangeTimeModal(vl);
    };

    const onChangeStartDateModal = (_time: any, timeString: any) => {
      if (timeString.length > 0) {
        cacheHoursStart.value = parseInt(timeString.split(":")[0]);
        cacheMinutesStart.value = parseInt(timeString.split(":")[1]);
        selectedStartDateModal.value = timeString;
      } else {
        selectedStartDateModal.value = "00:00";
      }
    };

    const onChangeEndDateModal = (_time: any, timeString: any) => {
      if (timeString != null) {
        const timePicker = timeString.split(":");
        cacheHoursEnd.value = parseInt(timePicker[0]);
        cacheMinutesEnd.value = parseInt(timePicker[1]);
      }
      if (timeString.length > 0) {
        selectedEndDateModal.value = timeString;
      } else {
        selectedEndDateModal.value = "00:00";
      }
    };

    const getRandomColor = (index: number) => {
      const strArr = ["#000000", "#0000FF", "#FF8C00", "#00FF00", "#FF00FF", "#00FFFF", "#808080", "#006400", "#191970", "#8B4513"];
      return strArr[index];
    };

    const getListData = (vl: Moment) => {
      if (calendarSchedules.value.length <= 0) return;
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == vl.date() && moment(daySchedule.day).month() == vl.month();
      });
      const dataReturn =
        listData.length > 0
          ? listData[0].schedules.map((schedule: any) => {
              schedule.color = color.value && color.value[schedule.classId];
              return schedule;
            })
          : [];
      return dataReturn;
    };

    const checkOverlapTime = (vl: Moment) => {
      if (calendarSchedules.value.length <= 0) return;
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == vl.date() && moment(daySchedule.day).month() == vl.month();
      });
      const dataReturn =
        listData.length > 0
          ? listData[0].schedules.map((schedule: any) => {
              return schedule;
            })
          : [];
      let isOverlap = false;
      const startTime: any[] | null = [];
      const endTime: any[] | null = [];
      dataReturn.forEach((data: any) => {
        startTime.push(data.start);
        endTime.push(data.end);
      });
      startTime.forEach((time: string, index) => {
        const timeStart = startTime[index];
        const timeEnd = endTime[index];
        if (timeStart != null && timeEnd != null) {
          startTime.forEach((totalTime: string, indexTotal) => {
            if (index != indexTotal && startTime[indexTotal] != null && endTime[indexTotal] != null) {
              const timeStartValue = parseInt(timeStart.split(":")[0]) * 60 + parseInt(timeStart.split(":")[1]);
              const timeEndValue = parseInt(timeEnd.split(":")[0]) * 60 + parseInt(timeEnd.split(":")[1]);
              const timeStartDataValue = parseInt(startTime[indexTotal].split(":")[0]) * 60 + parseInt(startTime[indexTotal].split(":")[1]);
              const timeEndDataValue = parseInt(endTime[indexTotal].split(":")[0]) * 60 + parseInt(endTime[indexTotal].split(":")[1]);
              if (
                (timeStartValue >= timeStartDataValue && timeStartValue < timeEndDataValue) ||
                (timeEndValue > timeStartDataValue && timeEndValue <= timeEndDataValue)
              ) {
                isOverlap = true;
                return false;
              }
            }
          });
        }
      });
      return isOverlap;
    };

    const canCreate = (vl: Moment) => {
      return vl.format("YYYY-MM-DD") >= moment().format("YYYY-MM-DD") && canCreateInCurrentDate(vl);
    };

    const canShowCreate = (vl: Moment) => {
      return vl.format("YYYY-MM-DD") >= moment().format("YYYY-MM-DD") && vl.month() == month.value.month() && canCreateInCurrentDate(vl);
    };

    const canCreateInCurrentDate = (vl: Moment) => {
      let result = false;
      const currentDate = vl.year() * totalDayOfYear + (vl.month() + 1) * totalDayOfMonth + vl.date();
      classesSchedules.value.map((cl: ClassModelSchedules) => {
        if (selectedClassId.value == "all" || selectedClassId.value == cl.classId) {
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

    const isUpdate = (item: any) => {
      return !item.customizedScheduleId.includes(recurringCustomIdFistFormat);
    };

    const getMonths = (vl: Moment) => {
      const current = vl.clone();
      const localeData = vl.localeData();
      const months = [];
      for (let i = 0; i < 12; i++) {
        current.month(i);
        months.push(localeData.monthsShort(current));
      }
      return months;
    };

    const getYears = (vl: Moment) => {
      const year = vl.year();
      const years = [];
      for (let i = year - 10; i < year + 10; i += 1) {
        years.push(i);
      }
      return years;
    };

    const getGroupModal = (data: any) => {
      return data.schedules
        .map((schedule: any) => {
          return { id: schedule.groupId, name: schedule.groupName };
        })
        .filter((v: any, i: any, a: any) => {
          return a.findIndex((t: any) => t.id === v.id) === i;
        });
    };

    const getDataModal = (date: Moment, customizedScheduleId?: string) => {
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == date.date() && moment(daySchedule.day).month() == date.month();
      });
      if (!customizedScheduleId || listData.length <= 0 || (customizedScheduleId && !customizedScheduleId.includes(recurringCustomIdFistFormat))) {
        listGroupModal.value = listGroupSelect.value;
      } else if (customizedScheduleId && customizedScheduleId.includes(recurringCustomIdFistFormat)) {
        listGroupModal.value = getGroupModal(listData[0]);
      }
    };

    const onValidateTime = () => {
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      const totalTimeStart = cacheHoursStart.value * 60 + cacheMinutesStart.value;
      const totalTimeEnd = cacheHoursEnd.value * 60 + cacheMinutesEnd.value;
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        const totalTimeNow = current.getHours() * 60 + current.getMinutes();
        if (totalTimeNow > totalTimeStart) {
          return true;
        }
      }
      return totalTimeStart >= totalTimeEnd;
    };

    const getDisableHoursStart = () => {
      const hours = [];
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        for (let i = 0; i < current.getHours(); i++) {
          hours.push(i);
        }
      }
      return hours;
    };

    const getDisableMinutesStart = () => {
      const minutes = [];
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        if (moment(selectedStartDateModal.value, formatTime).hour() == current.getHours()) {
          for (let i = 0; i < current.getMinutes(); i++) {
            minutes.push(i);
          }
        } else if (moment(selectedStartDateModal.value, formatTime).hour() < current.getHours()) {
          for (let i = 0; i < 60; i++) {
            minutes.push(i);
          }
        }
      }
      return minutes;
    };

    const getDisabledHoursEnd = () => {
      const hours = [];
      for (let i = 0; i < moment(selectedStartDateModal.value, formatTime).hour(); i++) {
        hours.push(i);
      }
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        for (let i = 0; i < current.getHours(); i++) {
          hours.push(i);
        }
      }
      return hours;
    };

    const getDisabledMinutesEnd = () => {
      const minutes = [];
      if (cacheHoursEnd.value < moment(selectedStartDateModal.value, formatTime).hour()) {
        for (let i = 0; i < 60; i++) {
          minutes.push(i);
        }
      } else if (cacheHoursEnd.value == moment(selectedStartDateModal.value, formatTime).hour()) {
        for (let i = 0; i <= moment(selectedStartDateModal.value, formatTime).minute(); i++) {
          minutes.push(i);
        }
      }
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        if (moment(selectedEndDateModal.value, formatTime).hour() == current.getHours()) {
          for (let i = 0; i < current.getMinutes(); i++) {
            minutes.push(i);
          }
        } else if (moment(selectedEndDateModal.value, formatTime).hour() < current.getHours()) {
          for (let i = 0; i < 60; i++) {
            minutes.push(i);
          }
        }
      }
      return minutes;
    };

    const onPanelChange = async (value: any, _mode: any) => {
      month.value = value;
      await getSchedules(selectedClassId.value, selectedGroupId.value, value);
    };

    const setSelectedStartDateModal = () => {
      const current = new Date();
      const m = current.getMonth();
      const d = current.getDate();
      if (d === selectedDate.value.date() && m === selectedDate.value.month()) {
        selectedStartDateModal.value = moment().format("HH:mm");
        selectedEndDateModal.value = moment().format("HH:mm");
      }
    };

    const updateListClassCreateNew = (vl: Moment) => {
      listClassCreateNew.value = listClassSelect.value.filter((cl: any) => {
        if (cl.endDate === null) {
          return true;
        } else if (cl.startDate.length > 0 && cl.endDate.length > 0) {
          const currentDate = vl.year() * 400 + (vl.month() + 1) * 31 + vl.date();
          const endDateTotalValue = cl.endDate.split("T")[0];
          const endDateSingleValue = endDateTotalValue.split("-");
          const endValue = parseInt(endDateSingleValue[0]) * 400 + parseInt(endDateSingleValue[1]) * 31 + parseInt(endDateSingleValue[2]);
          if (currentDate <= endValue) {
            return true;
          }
        }
        return false;
      });
    };

    const scheduleAction = async (type: string, timeLong: any, item?: any) => {
      const date = moment(timeLong).startOf("day");
      selectedDate.value = date;
      if (date.month() != month.value.month()) {
        month.value = date;
        return;
      }
      if (type == "Create") {
        updateListClassCreateNew(timeLong);
        await getDataModal(date);
        selectedClassIdModal.value = listClassCreateNew.value[0]?.id;
        await getGroupsModalByClass(listClassCreateNew.value[0]?.id);
        selectedGroupIdModal.value = listGroupModal.value[0]?.id;
        selectedStartDateModal.value = "00:00";
        selectedEndDateModal.value = "00:00";
        setSelectedStartDateModal();
        isCreate.value = true;
        visible.value = true;
      } else if (type == "Update") {
        updateListClassCreateNew(timeLong);
        if (item.history) return;
        await getDataModal(date, item.customizedScheduleId);
        isActionUpdate.value = true;
        listGroupModal.value = listClassCreateNew.value.filter((cl: any) => {
          return cl.id == item.classId;
        })[0].groups;
        selectedCustomScheduleId.value = item.customizedScheduleId;
        selectedClassIdModal.value = item.classId;
        selectedGroupIdModal.value = item.groupId;
        selectedTimeIdModal.value = item.timeId;
        selectedStartDateModal.value = moment(item.start, formatTime).format(formatTime);
        selectedEndDateModal.value = moment(item.end, formatTime).format(formatTime);
        isCreate.value = false;
        visible.value = true;
      } else {
        if (item.history) return;
        await getDataModal(date, item.customizedScheduleId);
        selectedCustomScheduleId.value = item.customizedScheduleId;
        selectedGroupIdModal.value = item.groupId;
        selectedTimeIdModal.value = item.timeId;
        if (item.start != null || item.end != null) {
          selectedStartDateModal.value = moment(item.start, formatTime).format(formatTime);
          selectedEndDateModal.value = moment(item.end, formatTime).format(formatTime);
        } else {
          selectedStartDateModal.value = "";
          selectedEndDateModal.value = "";
        }
        recurringVisible.value = true;
      }
      setCacheWhenUpdate(convertTime(selectedStartDateModal.value), convertTime(selectedEndDateModal.value));
    };

    const onCancel = () => {
      visible.value = false;
      recurringVisible.value = false;
      selectedStartDateModal.value = "00:00";
      selectedEndDateModal.value = "00:00";
      selectedGroupIdModal.value = "";
      isActionUpdate.value = false;
    };

    const convertTime = (time: string) => {
      return moment(time, formatTime).format("HH:mm:ss");
    };

    const resetCacheTime = () => {
      cacheMinutesStart.value = 0;
      cacheHoursStart.value = 0;
      cacheMinutesEnd.value = 0;
      cacheHoursEnd.value = 0;
    };

    const setCacheWhenUpdate = (start: string, end: string) => {
      if (start != null && end != null) {
        cacheHoursStart.value = parseInt(start.split(":")[0]);
        cacheMinutesStart.value = parseInt(start.split(":")[1]);
        cacheHoursEnd.value = parseInt(end.split(":")[0]);
        cacheMinutesEnd.value = parseInt(end.split(":")[1]);
      }
    };

    const createData = (type: string) => {
      const date = selectedDate.value;
      let schedule = [];
      const data = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == date.date() && moment(daySchedule.day).month() == date.month();
      })[0];
      if (data) {
        schedule = data.schedules.filter((schedule: any) => {
          if (schedule.customizedScheduleId != null || !schedule.customizedScheduleId.includes(recurringCustomIdFistFormat)) {
            return schedule.customizedScheduleId == selectedCustomScheduleId.value;
          } else {
            return schedule.timeId == selectedTimeIdModal.value;
          }
        })[0];
      }
      let dataBack = {};
      switch (type) {
        case "Delete":
          dataBack = { day: selectedDate.value.format(formatDateTime), data: { scheduleId: selectedCustomScheduleId.value, type: type } };
          resetCacheTime();
          break;
        case "Create":
          dataBack = {
            day: selectedDate.value.format(formatDateTime),
            groupName: listGroupModal.value.filter((group) => {
              return group.id == selectedGroupIdModal.value;
            })[0].name,
            className: listClassCreateNew.value.filter((group) => {
              return group.id == selectedClassIdModal.value;
            })[0].name,
            data: {
              schoolClassId: selectedClassIdModal.value,
              groupId: selectedGroupIdModal.value,
              start: selectedDate.value.format("YYYY-MM-DDT") + convertTime(selectedStartDateModal.value),
              end: selectedDate.value.format("YYYY-MM-DDT") + convertTime(selectedEndDateModal.value),
              type: type,
            },
          };
          resetCacheTime();
          break;
        case "Update":
          dataBack = {
            day: selectedDate.value.format(formatDateTime),
            groupName: listGroupModal.value.filter((group) => {
              return group.id == selectedGroupIdModal.value;
            })[0].name,
            data: {
              customizedScheduleId: selectedCustomScheduleId.value,
              schoolClassId: selectedClassId.value == "all" ? selectedClassIdModal.value : selectedClassId.value,
              groupId: selectedGroupIdModal.value,
              start: moment(data.day).format("YYYY-MM-DDT") + convertTime(selectedStartDateModal.value),
              end: moment(data.day).format("YYYY-MM-DDT") + convertTime(selectedEndDateModal.value),
              type: type,
              createdBy: loginInfo.profile.sub,
            },
          };
          break;
        case "Skip":
          dataBack = {
            day: selectedDate.value.format(formatDateTime),
            customId: selectedCustomScheduleId.value,
            data: {
              schoolClassId: schedule.classId,
              groupId: schedule.groupId,
              timeId: schedule.timeId,
              start: moment(data.day).format("YYYY-MM-DD"),
              end: moment(data.day).format("YYYY-MM-DD"),
              type: type,
            },
          };
          break;
      }
      return dataBack;
    };

    const onSkipSchedule = async (data: ScheduleParam) => {
      await store.dispatch("teacher/skipSchedule", data);
    };

    const onCreateSchedule = async (data: ScheduleParam) => {
      await store.dispatch("teacher/createSchedule", data);
    };

    const onUpdateSchedule = async (data: ScheduleParam) => {
      await store.dispatch("teacher/updateSchedule", data);
    };

    const onDeleteSchedule = async (data: ScheduleParam) => {
      await store.dispatch("teacher/deleteSchedule", data);
    };

    const onSubmit = async (type: string) => {
      switch (type) {
        case "Skip":
          await onSkipSchedule(createData(type));
          break;
        case "Create":
          await onCreateSchedule(createData(type));
          if (selectedClassId.value != "all") {
            await handleChangeClass(selectedClassId.value);
          }
          if (selectedGroupIdCache.value != "all") {
            await handleChangeGroup(selectedGroupIdCache.value);
          }
          break;
        case "Update":
          await onUpdateSchedule(createData(type));
          isActionUpdate.value = false;
          if (selectedClassId.value != "all") {
            await handleChangeClass(selectedClassId.value);
          }
          if (selectedGroupIdCache.value != filterAll) {
            await handleChangeGroup(selectedGroupIdCache.value);
          }
          break;
        case "Delete":
          await onDeleteSchedule(createData(type));
          break;
      }
      visible.value = false;
      recurringVisible.value = false;
    };

    const disableEndTime = (startTime: string) => {
      return startTime == "00:00";
    };

    const disableTimePicker = () => {
      return selectedEndDateModal.value.length > 0;
    };

    const disableSkipButton = () => {
      return selectedTimeIdModal.value;
    };

    const router = useRouter();
    const onClickBack = () => {
      router.push("/teacher");
    }

    return {
      listClassSelect,
      listClassCreateNew,
      listGroupSelect,
      listGroupModal,
      visible,
      recurringVisible,
      getListData,
      getMonths,
      getYears,
      onCancel,
      onPanelChange,
      isDisableGroup,
      selectedClassId,
      selectedClassIdModal,
      selectedGroupId,
      selectedGroupIdModal,
      selectedStartDateModal,
      selectedEndDateModal,
      handleChangeClass,
      handleChangeGroup,
      handleChangeClassModal,
      handleChangeGroupModal,
      onChangeStartDateModal,
      onChangeEndDateModal,
      getRandomColor,
      moment,
      onSubmit,
      scheduleAction,
      canCreate,
      canShowCreate,
      isCreate,
      isUpdate,
      loading,
      getDisabledHoursEnd,
      getDisabledMinutesEnd,
      disableEndTime,
      onValidateTime,
      IconWarning,
      checkOverlapTime,
      warningOverlap,
      disableTimePicker,
      disableSkipButton,
      getDisableHoursStart,
      getDisableMinutesStart,
      canCreateInCurrentDate,
      titleText,
      classText,
      groupText,
      startTimeText,
      endTimeText,
      deleteText,
      cancelText,
      saveText,
      skipText,
      closeText,
      noteText,
      schoolText,
      allText,
      onClickBack,
    };
  },
});
