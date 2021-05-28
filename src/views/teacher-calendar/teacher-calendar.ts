import { defineComponent, ref } from "vue";
import { Calendar, Select, Spin, Modal, Button, Row, Col } from "ant-design-vue";
import { Moment } from "moment";

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
    const value = ref<Moment>();
    const visible = ref(false);
    const recurringVisible = ref(false);

    const getListData = (value: any) => {
      let listData;
      switch (value.date()) {
        case 8:
          listData = [{ content: "This is warning event." }, { content: "This is usual event." }];
          break;
        case 10:
          listData = [{ content: "This is warning event." }, { content: "This is usual event." }, { content: "This is error event." }];
          break;
        case 15:
          listData = [
            { content: "This is warning event" },
            { content: "This is very long usual event。。...." },
            { content: "This is error event 1." },
            { content: "This is error event 2." },
            { content: "This is error event 3." },
            { content: "This is error event 4." },
          ];
          break;
        default:
      }
      return listData || [];
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
      value,
      visible,
      recurringVisible,
      getListData,
      getMonths,
      getYears,
      onSelect,
      onCancel,
    };
  },
});
