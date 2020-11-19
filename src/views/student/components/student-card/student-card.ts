import { defineComponent } from "vue";

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
  },
  setup(props) {
    const userAvatar = props.avatar
      ? props.avatar
      : "/assets/images/user-default.png";
    return {
      userAvatar,
    };
  },
});
