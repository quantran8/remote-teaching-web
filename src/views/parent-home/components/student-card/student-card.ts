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
    const classText = computed(() => fmtMsg(ParentStudentCardLocale.Class));
    const groupText = computed(() => fmtMsg(ParentStudentCardLocale.Group));
    const nextSessionText = computed(() => fmtMsg(ParentStudentCardLocale.NextSession));
    const convertDate = (time: string) => {
      return moment(time).format("MM/DD - HH:mm");
    };
    return {
      classText,
      groupText,
      nextSessionText,
      userAvatar,
      convertDate,
    };
  },
});
