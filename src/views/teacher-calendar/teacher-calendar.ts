import { computed, defineComponent, ref, onMounted, watch } from "vue";
import { Calendar, Select, Spin, Modal, Button, Row, Col, TimePicker } from "ant-design-vue";
import { Moment } from "moment";
import { useStore } from "vuex";
import moment from "moment";
import { ClassModel } from "@/models";
import { useRoute } from "vue-router";
import { ScheduleParam } from "@/services";
import { LoginInfo } from "@/commonui";

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
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { schoolId } = route.params;
    const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
    const visible = ref<boolean>(false);
    const recurringVisible = ref<boolean>(false);
    const listClassSelect = ref<any[]>([]);
    const listGroupSelect = ref<any[]>([]);
    const listGroupModal = ref<any[]>([]);
    const selectedClassId = ref<string>("all");
    const selectedClassIdModal = ref<string>("");
    const selectedGroupId = ref<string>("all");
    const selectedGroupIdModal = ref<string>("");
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
    const isCreate = ref<boolean>(false);
    const classes = computed(() => store.getters["teacher/classes"]);
    const recurringCustomIdFistFormat = "0000-";
    const loading = ref(false);

    const getClassBySchoolId = async (schoolId: any) => {
      await store.dispatch("teacher/loadClasses", { schoolId: schoolId });
    };

    onMounted(async () => {
      await getClassBySchoolId(schoolId);
      await getListClassSelect(classes.value);
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
        startDate: month.startOf("month").format(),
        endDate: month.endOf("month").format(formatDateTime),
      });
      loading.value = false;
    };

    const getListClassSelect = async (listClass: ClassModel[]) => {
      const listClassFilter = listClass.map((cl: any) => {
        let listGroup = [];
        listGroup = cl.remoteClassGroups.map((group: any) => {
          return { id: group.id, name: group.groupName };
        });
        return { id: cl.schoolClassId, name: cl.schoolClassName, groups: listGroup };
      });
      color.value = listClassFilter
        .map((cl: any) => {
          return cl.id;
        })
        .reduce((hash: any, elem: any) => {
          hash[elem] = getRandomColor();
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
      const currentClass = listClassSelect.value.filter((cl: any) => {
        return cl.id == classId;
      })[0];
      listGroupModal.value = currentClass.groups;
      selectedGroupIdModal.value = currentClass.groups.length > 0 ? currentClass.groups[0].id : "";
    };

    const handleChangeClass = async (vl: string) => {
      selectedClassId.value = vl;
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
      const group = listData[0].schedules.filter((schedule: any) => {
        return schedule.groupId == groupId;
      });
      selectedStartDateModal.value = !isCreate.value ? group[0].start : "00:00";
      selectedEndDateModal.value = !isCreate.value ? group[0].end : "00:00";
    };

    const handleChangeClassModal = (vl: string) => {
      selectedClassIdModal.value = vl;
      getGroupsModalByClass(vl);
    };

    const handleChangeGroupModal = (vl: string) => {
      selectedGroupIdModal.value = vl;
      handleChangeTimeModal(vl);
    };

    const onChangeStartDateModal = (time: any, timeString: any) => {
      selectedStartDateModal.value = timeString;
    };

    const onChangeEndDateModal = (time: any, timeString: any) => {
      selectedEndDateModal.value = timeString;
    };

    const getRandomColor = () => {
      const lum = -0.25;
      let hex = String(
        "#" +
          Math.random()
            .toString(16)
            .slice(2, 8)
            .toUpperCase(),
      ).replace(/[^0-9a-f]/gi, "");
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      let rgb = "#",
        c,
        i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
      }
      return rgb;
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

    const canCreate = (vl: Moment) => {
      return vl.format("YYYY-MM-DD") >= moment().format("YYYY-MM-DD");
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

    const getDisabledHoursEnd = () => {
      const hours = [];
      for (let i = 0; i < moment(selectedStartDateModal.value, formatTime).hour(); i++) {
        hours.push(i);
      }
      return hours;
    };

    const getDisabledMinutesEnd = () => {
      const minutes = [];
      for (let i = 0; i < moment(selectedStartDateModal.value, formatTime).minute(); i++) {
        minutes.push(i);
      }
      return minutes;
    };

    const onPanelChange = async (value: any, _mode: any) => {
      month.value = value;
      await getSchedules(selectedClassId.value, selectedGroupId.value, value);
    };

    const scheduleAction = async (type: string, timeLong: any, item?: any) => {
      const date = moment(timeLong).startOf("day");
      selectedDate.value = date;
      if (date.month() != month.value.month()) {
        month.value = date;
        return;
      }
      if (type == "Create") {
        await getDataModal(date);
        selectedClassIdModal.value = listClassSelect.value[0]?.id;
        getGroupsModalByClass(listClassSelect.value[0]?.id);
        selectedGroupIdModal.value = listGroupModal.value[0]?.id;
        selectedStartDateModal.value = "00:00";
        selectedEndDateModal.value = "00:00";
        isCreate.value = true;
        visible.value = true;
      } else if (type == "Update") {
        if (item.history) return;
        await getDataModal(date, item.customizedScheduleId);
        listGroupModal.value = [{ id: item.groupId, name: item.groupName }];
        selectedCustomScheduleId.value = item.customizedScheduleId;
        selectedClassIdModal.value = item.classId;
        selectedGroupIdModal.value = item.groupId;
        selectedStartDateModal.value = moment(item.start, formatTime).format(formatTime);
        selectedEndDateModal.value = moment(item.end, formatTime).format(formatTime);
        isCreate.value = false;
        visible.value = true;
      } else {
        if (item.history) return;
        await getDataModal(date, item.customizedScheduleId);
        selectedCustomScheduleId.value = item.customizedScheduleId;
        selectedGroupIdModal.value = item.groupId;
        selectedStartDateModal.value = moment(item.start, formatTime).format(formatTime);
        selectedEndDateModal.value = moment(item.end, formatTime).format(formatTime);
        recurringVisible.value = true;
      }
    };

    const onCancel = () => {
      visible.value = false;
      recurringVisible.value = false;
      selectedStartDateModal.value = "00:00";
      selectedEndDateModal.value = "00:00";
      selectedGroupIdModal.value = "";
    };

    const convertTime = (time: string) => {
      return moment(time, formatTime).format("HH:mm:ss");
    };

    const createData = (type: string) => {
      const date = selectedDate.value;
      let schedule = [];
      const data = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == date.date() && moment(daySchedule.day).month() == date.month();
      })[0];
      if (data) {
        schedule = data.schedules.filter((schedule: any) => {
          return schedule.groupId == selectedGroupIdModal.value;
        })[0];
      }
      let dataBack = {};
      switch (type) {
        case "Delete":
          dataBack = { day: selectedDate.value.format(formatDateTime), data: { scheduleId: selectedCustomScheduleId.value, type: type } };
          break;
        case "Create":
          dataBack = {
            day: selectedDate.value.format(formatDateTime),
            groupName: listGroupModal.value.filter(group => {
              return group.id == selectedGroupIdModal.value;
            })[0].name,
            className: listClassSelect.value.filter(group => {
              return group.id == selectedClassIdModal.value;
            })[0].name,
            data: {
              schoolClassId: selectedClassIdModal.value,
              groupId: selectedGroupIdModal.value,
              start: selectedDate.value.format("YYYY-MM-DDT") + convertTime(selectedStartDateModal.value) + moment().format("Z"),
              end: selectedDate.value.format("YYYY-MM-DDT") + convertTime(selectedEndDateModal.value) + moment().format("Z"),
              type: type,
            },
          };
          break;
        case "Update":
          dataBack = {
            day: selectedDate.value.format(formatDateTime),
            data: {
              customizedScheduleId: selectedCustomScheduleId.value,
              schoolClassId: selectedClassId.value == "all" ? selectedClassIdModal.value : selectedClassId.value,
              groupId: selectedGroupIdModal.value,
              start: moment(data.day).format("YYYY-MM-DDT") + convertTime(selectedStartDateModal.value) + moment().format("Z"),
              end: moment(data.day).format("YYYY-MM-DDT") + convertTime(selectedEndDateModal.value) + moment().format("Z"),
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
              start: data.day.replace("00:00:00", schedule.start),
              end: data.day.replace("00:00:00", schedule.end),
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
          break;
        case "Update":
          await onUpdateSchedule(createData(type));
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

    return {
      listClassSelect,
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
      isCreate,
      isUpdate,
      loading,
      getDisabledHoursEnd,
      getDisabledMinutesEnd,
      disableEndTime,
    };
  },
});
