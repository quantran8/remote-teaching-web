import { times } from "lodash";
import { computed, defineComponent, ref, onMounted } from "vue";
import { Calendar, Select, Spin, Modal, Button, Row, Col } from "ant-design-vue";
import { Moment } from "moment";
import { useStore } from "vuex";
import moment from "moment";
import { CalendarSchedulesModel, ClassModel } from "@/models";
import { useRoute } from "vue-router";

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
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { schoolId } = route.params;
    const value = ref<Moment>();
    const visible = ref<boolean>(false);
    const recurringVisible = ref<boolean>(false);
    const listClassSelect = ref<any[]>([]);
    const listGroupSelect = ref<any[]>([]);
    const classIsChoose = ref<string>("all");
    const groupIsChoose = ref<string>("all");
    const isDisableGroup = ref<boolean>(true);
    const calendarSchedules = computed(() => store.getters["teacher/calendarSchedules"]);
    const startOfMonth = moment()
      .clone()
      .startOf("month")
      .format();
    const endOfMonth = moment()
      .clone()
      .endOf("month")
      .format();

    onMounted(async () => {
      await store.dispatch("teacher/loadClasses", { schoolId: schoolId });
      const classes = store.getters["teacher/classes"];
      if (classes.length <= 0) return;
      getSchedules("null", startOfMonth, endOfMonth, "null");
      getListClassSelect(classes);
    });

    const getSchedules = async (schoolClassId: string, startDate: string, endDate: string, groupId: string) => {
      await store.dispatch("teacher/loadSchedules", {
        classId: schoolClassId,
        groupId: groupId,
        startDate: startDate,
        endDate: endDate,
      });
    };

    const getListClassSelect = (listClass: ClassModel[]) => {
      listClassSelect.value = listClass.map((cl: any) => {
        let listGroup = [];
        listGroup = cl.remoteClassGroups.map((group: any) => {
          return { id: group.id, name: group.groupName };
        });
        return { id: cl.schoolClassId, name: cl.schoolClassName, groups: listGroup };
      });
    };

    const getGroupByClass = (classId: string) => {
      const currentClass = listClassSelect.value.filter((cl: any) => {
        return cl.id == classId;
      })[0];
      listGroupSelect.value = currentClass.groups;
    };

    const handleChangeClass = (value: string) => {
      classIsChoose.value = value;
      if (value != "all") {
        getSchedules(value, startOfMonth, endOfMonth, "null");
        getGroupByClass(value);
        isDisableGroup.value = false;
      } else {
        getSchedules("null", startOfMonth, endOfMonth, "null");
        groupIsChoose.value = "all";
        isDisableGroup.value = true;
      }
    };

    const handeChangeGroup = (value: string) => {
      groupIsChoose.value = value;
      if (value != "all") {
        getSchedules(classIsChoose.value, startOfMonth, endOfMonth, value);
      } else {
        getSchedules(classIsChoose.value, startOfMonth, endOfMonth, "null");
      }
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

    const getListData = (value: Moment) => {
      if (calendarSchedules.value.length <= 0) return;
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == value.date() && moment(daySchedule.day).month() == value.month();
      });
      return listData.length > 0
        ? listData[0].schedules.map((schedule: any) => {
            schedule.color = getRandomColor();
            return schedule;
          })
        : [];
    };

    const getMonths = (value: Moment) => {
      const current = value.clone();
      const localeData = value.localeData();
      const months = [];
      for (let i = 0; i < 12; i++) {
        current.month(i);
        months.push(localeData.monthsShort(current));
      }
      return months;
    };

    const getYears = (value: Moment) => {
      const year = value.year();
      const years = [];
      for (let i = year - 10; i < year + 10; i += 1) {
        years.push(i);
      }
      return years;
    };

    const onSelect = (value: Moment) => {
      getSchedules(
        classIsChoose.value == "all" ? "null" : classIsChoose.value,
        value.startOf("month").format(),
        value.endOf("month").format(),
        groupIsChoose.value == "all" ? "null" : groupIsChoose.value,
      );
      if (value.month() != moment().month()) {
        return;
      }
      if (value.weekday() % 2) {
        visible.value = true;
      } else {
        recurringVisible.value = true;
      }
    };

    const onCancel = () => {
      visible.value = false;
      recurringVisible.value = false;
    };

    return {
      listClassSelect,
      listGroupSelect,
      value,
      visible,
      recurringVisible,
      getListData,
      getMonths,
      getYears,
      onSelect,
      onCancel,
      isDisableGroup,
      classIsChoose,
      groupIsChoose,
      handleChangeClass,
      handeChangeGroup,
      getRandomColor,
    };
  },
});
