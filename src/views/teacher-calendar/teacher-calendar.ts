import { computed, defineComponent, ref, onMounted, watch } from "vue";
import { Calendar, Select, Spin, Modal, Button, Row, Col } from "ant-design-vue";
import { Moment } from "moment";
import { useStore } from "vuex";
import moment from "moment";
import { ClassModel } from "@/models";
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
    const visible = ref<boolean>(false);
    const recurringVisible = ref<boolean>(false);
    const listClassSelect = ref<any[]>([]);
    const listGroupSelect = ref<any[]>([]);
    const classIsChoose = ref<string>("all");
    const groupIsChoose = ref<string>("all");
    const isDisableGroup = ref<boolean>(true);
    const calendarSchedules = computed(() => store.getters["teacher/calendarSchedules"]);
    const color = ref();
    const startMonth = ref<Moment>(
      moment()
        .clone()
        .startOf("month"),
    );
    const endMonth = ref<Moment>(
      moment()
        .clone()
        .endOf("month"),
    );

    onMounted(async () => {
      await store.dispatch("teacher/loadClasses", { schoolId: schoolId });
      const classes = store.getters["teacher/classes"];
      if (classes.length <= 0) return;
      getSchedules("null", startMonth.value.format(), endMonth.value.format(), "null");
      getListClassSelect(classes);
    });

    watch(calendarSchedules, () => {
      if (!calendarSchedules.value) return;
      getColor();
    });

    const getSchedules = async (schoolClassId: string, startDate: string, endDate: string, groupId: string) => {
      await store.dispatch("teacher/loadSchedules", {
        classId: schoolClassId,
        groupId: groupId,
        startDate: startDate,
        endDate: endDate,
      });
    };

    const getColor = () => {
      const listClassId = calendarSchedules.value
        .map((calendarSchedule: any) => {
          return calendarSchedule.schedules.map((schedule: any) => {
            return schedule.class.id;
          });
        })
        .flat(1)
        .filter((v: any, i: any, a: any) => {
          return a.indexOf(v) === i;
        });
      color.value = listClassId.reduce((hash: any, elem: any) => {
        hash[elem] = getRandomColor();
        return hash;
      }, {});
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

    const handleChangeClass = (vl: string) => {
      classIsChoose.value = vl;
      if (vl != "all") {
        getSchedules(vl, startMonth.value.format(), endMonth.value.format(), "null");
        getGroupByClass(vl);
        isDisableGroup.value = false;
      } else {
        getSchedules("null", startMonth.value.format(), endMonth.value.format(), "null");
        groupIsChoose.value = "all";
        isDisableGroup.value = true;
      }
    };

    const handeChangeGroup = (vl: string) => {
      groupIsChoose.value = vl;
      if (vl != "all") {
        getSchedules(classIsChoose.value, startMonth.value.format(), endMonth.value.format(), vl);
      } else {
        getSchedules(classIsChoose.value, startMonth.value.format(), endMonth.value.format(), "null");
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

    const getListData = (vl: Moment) => {
      if (calendarSchedules.value.length <= 0) return;
      const listData = calendarSchedules.value.filter((daySchedule: any) => {
        return moment(daySchedule.day).date() == vl.date() && moment(daySchedule.day).month() == vl.month();
      });
      return listData.length > 0
        ? listData[0].schedules.map((schedule: any) => {
            schedule.color = color.value[schedule.class.id];
            return schedule;
          })
        : [];
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

    const onSelect = (vl: Moment) => {
      if (vl.month() != startMonth.value.month()) {
        startMonth.value = vl.startOf("month");
        endMonth.value = vl.endOf("month");
        getSchedules(
          classIsChoose.value == "all" ? "null" : classIsChoose.value,
          startMonth.value.format(),
          endMonth.value.format(),
          groupIsChoose.value == "all" ? "null" : groupIsChoose.value,
        );
        return;
      }
      if (vl.weekday() % 2) {
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
