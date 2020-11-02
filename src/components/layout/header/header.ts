import { defineComponent } from "vue";

import MenuItem from "./components/menu-item/menu-item.vue";

export default defineComponent({
  props:{
    title: String,
  },
  components: {
    MenuItem,
  },
  setup(props) {
    return {
      ...props
    }
  },
});
