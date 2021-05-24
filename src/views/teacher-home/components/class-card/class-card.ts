import { SchoolClassTimeModel} from  "@/models/group.model";
import { defineComponent, onMounted, ref } from "vue";
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

    onMounted(() => {
      if (props.remoteClassGroups) {
        const newGroups = props.remoteClassGroups.map(group => {
          const currentDay = moment().weekday();
          const classTime = group.schoolClassTimeDto;
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

    const clickToAccess = () => {
      emit("click-to-access");
    };

    return { groups, clickToAccess };
  },
});
