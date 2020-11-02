import { defineComponent, ref } from "vue";
import LessonActivity from "./lesson-activity/lesson-activity.vue";
export default defineComponent({
  components: { LessonActivity },
  setup() {
    const data = [
      {
        id: 1,
        title: "Troy and Lola Joy",
        type: "Song",
        duration: "2:00-2:30",
      },
      {
        id: 2,
        title: "The Ocean",
        type: "Poem",
        duration: "0:45-1:00",
      },
      {
        id: 3,
        title: "GrapeSEED School, We Like You",
        type: "Story",
        duration: "2:30-3:00",
      },
      {
        id: 4,
        title: "Transition",
        type: "",
        duration: "1:00",
      },
      {
        id: 5,
        title: "Funny Friends",
        type: "Song",
        duration: "2:30-3:00",
      },
      {
        id: 6,
        title: "Phonograms",
        type: "",
        duration: "1:30-3:00",
      },
      {
        id: 7,
        title: "The Zoo",
        type: "Big Book",
        duration: "1:00-1:30",
      },
      {
        id: 8,
        title: "Transition",
        type: "",
        duration: "1:00",
      },
      {
        id: 9,
        title: "Opposite Direction",
        type: "Action Activity",
        duration: "3:00-3:30",
      },
      {
        id: 10,
        title: "What Do You See?",
        type: "Chant",
        duration: "2:30-3:00",
      },
      {
        id: 11,
        title: "Transition",
        type: "",
        duration: "1:00",
      },
      {
        id: 12,
        title: "These’s a Hole!",
        type: "Song",
        duration: "2:30-4:00",
      },
      {
        id: 13,
        title: "Reading",
        type: "",
        duration: "3:30-4:00",
      },
      {
        id: 14,
        title: "Writing",
        type: "",
        duration: "10:00-10:30",
      },
    ];

    const activities = ref(
      data.map((item) => {
        let time = 0;
        if (item.duration) {
          let str = "";
          if (item.duration.indexOf("-") !== -1) {
            const arr = item.duration.split("-");
            if (arr.length > 0) {
              str = arr[arr.length - 1];
            }
          } else {
            str = item.duration;
          }
          if (str && str.indexOf(":") !== -1) {
            const items = str.split(":");
            if (items.length === 2) {
              time = parseInt(items[0]) * 60 + parseInt(items[1]);
            }
          }
        }
        return {
          time: time,
          isDone: false,
          ...item,
        };
      })
    );
    const currentActivityId = ref(1);
    const totalActivities = activities.value.length;
    const progress = ref(currentActivityId.value / totalActivities);
    const setCurrentActivity = (index: number) => {
      currentActivityId.value = index;
      progress.value = totalActivities === 0 ? 0 : index / totalActivities;
    };
    const remainingTime = () => {
      let time = 0;
      for (const item of activities.value) {
        if (!item.isDone) time += item.time;
      }
      const hours = Math.floor(time / (60 * 60));
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const toStr = (val: number) => {
        if (val < 10) return "0" + val;
        return val;
      };
      return (
        (hours ? `${toStr(hours)}:` : "") +
        `${toStr(minutes)}:${toStr(seconds)}`
      );
    };

    return {
      activities,
      currentActivityId,
      progress,
      totalActivities,
      remainingTime,
      setCurrentActivity,
    };
  },
});
