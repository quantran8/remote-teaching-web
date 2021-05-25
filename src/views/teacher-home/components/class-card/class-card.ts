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
  },
  components: {
    Spin,
  },
  emits: ["click-to-access"],
  setup(props, { emit }) {
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
      if (startDate === "" || endDate === "" || day !== daysOfWeek) {
        return false;
      }

      const currentTime = h * 60 + m;
      // get input time
      const timeStart = startDate.split(":");
      const hourStart = parseInt(timeStart[0], 10);
      const minStart = parseInt(timeStart[1], 10);
      const inputTimeStart = hourStart * 60 + minStart - 30;
      const timeEnd = endDate.split(":");
      const hourEnd = parseInt(timeEnd[0], 10);
      const minEnd = parseInt(timeEnd[1], 10);
      const inputTimeEnd = hourEnd * 60 + minEnd;
      if (inputTimeStart <= currentTime && currentTime <= inputTimeEnd) {
        return true;
      } else {
        return false;
      }
    };

    onMounted(() => {
      if (props.remoteClassGroups) {
        const newGroups = props.remoteClassGroups.map(group => {
          const currentDay = moment().weekday();
          const classTime = group.schedules;
          classTime.map(time => {
            if (time.daysOfWeek - 1 == currentDay) {
              group.isCurrentDay = true;
              group.startClass = isActiveClass(time.daysOfWeek - 1, time.start, time.end);
            }
          });
          if (classTime.length > 1) {
            classTime.sort((current, next) => {
              return current.daysOfWeek - next.daysOfWeek;
            });
            const greaterDay = classTime.filter(time => {
              return time.daysOfWeek - 1 > currentDay;
            });
            const lowerDay = classTime.filter(time => {
              return time.daysOfWeek - 1 <= currentDay;
            });
            let nextDay: SchoolClassTimeModel;
            let isLow = false;
            if (greaterDay.length <= 0) {
              isLow = true;
              nextDay = lowerDay[0];
            } else {
              isLow = false;
              nextDay = greaterDay[0];
            }
            group.next = `${moment()
              .day(isLow ? nextDay.daysOfWeek + 6 : nextDay.daysOfWeek - 1)
              .format("MM/DD")} ${nextDay.start ? nextDay.start.split(":")[0] + ":" + nextDay.start.split(":")[1] : ""}`;
          } else {
            let nextDay = 0;
            if (classTime[0]) {
              if (classTime[0].daysOfWeek - 1 <= currentDay) {
                nextDay = classTime[0].daysOfWeek + 6;
              } else {
                nextDay = classTime[0].daysOfWeek - 1;
              }
              group.next = `${moment()
                .day(nextDay)
                .format("MM/DD")} ${classTime[0].start ? classTime[0].start.split(":")[0] + ":" + classTime[0].start.split(":")[1] : ""}`;
            } else {
              group.next = " ";
            }
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
