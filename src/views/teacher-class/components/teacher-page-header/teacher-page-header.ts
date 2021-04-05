import { defineComponent } from "vue";
export default defineComponent({
  props: {
    teacherName: String,
    className: String
  },
  emits: ["end"],
  setup(props, { emit }) {

    const onClickEnd = () => {
      emit("end");
    };

    return {
      onClickEnd
    };
  }
});
