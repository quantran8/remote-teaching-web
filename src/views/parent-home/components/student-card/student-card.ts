import { StudentNextSessionModel } from "@/models";
import { computed, defineComponent } from "vue";
import moment from "moment";
import { fmtMsg } from "@/commonui";
import { ParentStudentCardLocale } from "@/locales/localeid";

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    nextSessionInfo: {
      type: Object as () => StudentNextSessionModel,
    },
  },
  setup(props) {
    const userAvatar = props.avatar ? props.avatar : "/assets/images/user-default.png";
    const classGroupText = computed(() => fmtMsg(ParentStudentCardLocale.ClassGroup));
    const startTimeText = computed(() => fmtMsg(ParentStudentCardLocale.StartTime));

    const getInfo = (nextSessionInfo: any) => {
      let info = "";
      if (!nextSessionInfo) return info;
      info = classGroupText.value + nextSessionInfo.classInfo.className;
      if (nextSessionInfo.classInfo.groupName) {
        info += "/" + nextSessionInfo.classInfo.groupName;
      }
      return info;
    };

    const convertDate = (time: string) => {
      let timeString = "";
      if (time) {
        timeString = startTimeText.value + moment(time).format("MM/DD - HH:mm");
        if (timeString.includes("00:00")) {
          timeString = timeString.replace(" - 00:00", "");
        }
      }
      return timeString;
    };

    return {
      userAvatar,
      convertDate,
      classGroupText,
      getInfo,
    };
  },
});
