import { defineComponent } from "vue";

type LayoutType = "" | "full" | "main";

export default defineComponent({
  props: ["type"],
  setup(props) {
    return {};
  },
});
