import { StudentNextSessionModel } from "@/models";
import { computed, defineComponent } from "vue";
import moment from "moment";
import { fmtMsg } from "vue-glcommonui";
import { ParentStudentCardLocale } from "@/locales/localeid";
import noAvatar from "@/assets/images/user-default.png";

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
    const userAvatar = props.avatar ? props.avatar : noAvatar;
    const classGroupText = computed(() => fmtMsg(ParentStudentCardLocale.ClassGroup));
    const startTimeText = computed(() => fmtMsg(ParentStudentCardLocale.StartTime));
    const getInfo = () => {
      let info = "";
      if (!props.nextSessionInfo || !props.nextSessionInfo.classInfo) {
        return info;
      }
      info = props.nextSessionInfo.classInfo.className;
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
