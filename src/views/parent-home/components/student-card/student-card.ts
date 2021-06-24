import { StudentNextSessionModel } from "@/models";
import { defineComponent } from "vue";
import moment from "moment";

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
    const convertDate = (time: string) => {
      return moment(time).format("MM/DD - HH:mm");
    };
    return {
      userAvatar,
      convertDate,
    };
  },
});
