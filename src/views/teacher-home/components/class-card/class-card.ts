import { SchoolClassTimeModel } from "@/models/group.model";
import { defineComponent, onMounted, ref } from "vue";
import { Spin } from "ant-design-vue";
import { GroupModel } from "@/models/group.model";
import moment from "moment";

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
      type: Object as () => Array<GroupModel>,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    loadingStart: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Spin,
  },
  emits: ["click-to-access"],
  setup: function(props, { emit }) {
    const groups = ref();
    const clickedGroup = ref<string>("");
    const isActiveClass = (daysOfWeek: number, startDate: string, endDate: string) => {
      //check daysOfWeek, startDate, endDate, return false if one of them is null or undefined
      if ([daysOfWeek, startDate, endDate].some(t => t == null)) return false;
      // get system local time
      const current = new Date();
      const day = current.getDay();
      const m = current.getMinutes();
      const h = current.getHours();
      if (!startDate || !endDate || day !== daysOfWeek) {
        return false;
      }
      const currentTime = 1440 * day + h * 60 + m;
      // get input time
      const timeStart = startDate.split(":");
      const hourStart = parseInt(timeStart[0], 10);
      const minStart = parseInt(timeStart[1], 10);
      const inputTimeStart = 1440 * daysOfWeek + hourStart * 60 + minStart - 15;
      const timeEnd = endDate.split(":");
      const hourEnd = parseInt(timeEnd[0], 10);
      const minEnd = parseInt(timeEnd[1], 10);
      const inputTimeEnd = 1440 * daysOfWeek + hourEnd * 60 + minEnd;
      return (inputTimeStart <= currentTime && currentTime <= inputTimeEnd) || (inputTimeStart < 0 && currentTime > 7 * 1440 + inputTimeStart);
    };

    const validatedTime = (classTime: SchoolClassTimeModel[]) => {
      let min = 99999;
      let indexMin = 0;
      let minTime = 99999;
      let indexMinTime = 0;
      const current = new Date();
      const d = moment().weekday();
      const m = current.getMinutes();
      const h = current.getHours();
      const currentTime = d * 1440 + h * 60 + m;
      let hasTime = false;
      classTime.forEach((value, index) => {
        const { end } = value;
        if ([end].some(t => t == null)) return null;
        hasTime = true;
        const timeEnd = value.end.split(":");
        const hourEnd = parseInt(timeEnd[0], 10);
        const minEnd = parseInt(timeEnd[1], 10);
        const dayEnd = value.daysOfWeek - 1;
        const inputTimeEnd = 1440 * dayEnd + hourEnd * 60 + minEnd;
        if (inputTimeEnd < minTime) {
          minTime = inputTimeEnd;
          indexMinTime = index;
        }
        if (inputTimeEnd > currentTime) {
          if (inputTimeEnd - currentTime < min) {
            min = inputTimeEnd - currentTime;
            indexMin = index;
          }
        }
      });
      if (!hasTime) {
        return null;
      }
      if (min !== 99999) {
        return classTime[indexMin];
      } else {
        classTime[indexMinTime].daysOfWeek += 7;
        return classTime[indexMinTime];
      }
    };

    const validatedGroupHighlighted = () => {
      let min = 999999;
      let indexMin = -1;
      let hasGroupActive = false;
      const current = new Date();
      const d = moment().weekday();
      const m = current.getMinutes();
      const h = current.getHours();
      const currentTime = d * 1440 + h * 60 + m;
      props.remoteClassGroups.map((group, index) => {
        const classTime = group.schedules;
        const nextDay = validatedTime(classTime);
        if(nextDay != null) {
          const timeStart = nextDay.start.split(":");
          const timeEnd = nextDay.end.split(":");
          const timeStartValue = (nextDay.daysOfWeek-1)*1440 + parseInt(timeStart[0], 10)*60 + parseInt(timeStart[1], 10);
          const timeEndValue = (nextDay.daysOfWeek-1)*1440 + parseInt(timeEnd[0], 10)*60 + parseInt(timeEnd[1], 10);
          if(timeStartValue <= currentTime && currentTime <= timeEndValue){
            hasGroupActive = true;
            group.isHighLighted = true;
          }
          const timeValue = timeStartValue;
          if(timeValue - currentTime > 0){
            if(timeValue - currentTime < min){
              min = timeValue - currentTime;
              indexMin = index;
            }
          } else if(timeValue + 10080 - currentTime < min) {
            min = timeValue - currentTime;
            indexMin = index;
          }
        }
      });
      if(hasGroupActive == false) {
        props.remoteClassGroups.map((group, index) => {
          if (indexMin == index) {
            group.isHighLighted = true;
          } else {
            group.isHighLighted = false;
          }
        });
      }
    };

    onMounted(() => {
      if (props.remoteClassGroups) {
        validatedGroupHighlighted();
        const newGroups = props.remoteClassGroups.map(group => {
          const currentDay = moment().weekday();
          const classTime = group.schedules;
          let hasActiveClass = false;
          classTime.map(time => {
            if (time.daysOfWeek - 1 == currentDay) {
              group.isCurrentDay = true;
              if (!hasActiveClass) {
                group.startClass = isActiveClass(time.daysOfWeek - 1, time.start, time.end);
                hasActiveClass = group.startClass;
              } else {
                group.startClass = true;
              }
            }
          });
          const nextDay = validatedTime(classTime);
          if (nextDay != null) {
            group.next = `${moment()
              .day(nextDay.daysOfWeek - 1)
              .format("MM/DD")} ${nextDay.start ? nextDay.start.split(":")[0] + ":" + nextDay.start.split(":")[1] : ""}`;
          } else {
            group.next = "";
          }
          return group;
        });
        groups.value = newGroups;
      } else {
        groups.value = [];
      }
    });

    const clickToAccess = (groupId: string) => {
      clickedGroup.value = groupId;
      emit("click-to-access", groupId);
    };

    return { groups, clickToAccess, clickedGroup };
  },
});
