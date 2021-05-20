import { SchoolClassTimeModel } from "./../../../../models/group.model";
import { computed, defineComponent, ref, watch } from "vue";
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
  emits: ["click-to-access"],
  setup(props, { emit }) {
    const groups = ref();
    const btnText = computed(() => {
      return props.active ? "Join now" : "Start";
    });

    watch(props, () => {
      if (props.remoteClassGroups) {
        const newGroups = props.remoteClassGroups.map(group => {
          const currentDay = moment().weekday();
          const classTime = group.schoolClassTimeDto;
          if (classTime.length > 1) {
            classTime.sort((current, next) => {
              return current.daysOfWeek - next.daysOfWeek;
            });
            const greaterDay = classTime.filter(time => {
              return time.daysOfWeek > currentDay;
            });
            const lowerDay = classTime.filter(time => {
              return time.daysOfWeek < currentDay;
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
              .day(isLow ? nextDay.daysOfWeek + 7 : nextDay.daysOfWeek)
              .format("MM/DD")} ${nextDay.start ? nextDay.start.split(":")[0] + ":" + nextDay.start.split(":")[1] : ""}`;
          } else {
            let nextDay = 0;
            if (classTime[0].daysOfWeek <= currentDay) {
              nextDay = classTime[0].daysOfWeek + 7;
            } else {
              nextDay = classTime[0].daysOfWeek;
            }
            group.next = `${moment()
              .day(nextDay)
              .format("MM/DD")} ${classTime[0].start ? classTime[0].start.split(":")[0] + ":" + classTime[0].start.split(":")[1] : ""}`;
          }
          return group;
        });
        groups.value = newGroups;
      } else {
        groups.value = [];
      }
    });

    const clickToAccess = () => {
      emit("click-to-access");
    };

    return { groups, btnText, clickToAccess };
  },
});
