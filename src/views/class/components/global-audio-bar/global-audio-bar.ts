import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const onDrop = (event: any) => {
      console.log("OnDrop", event);
    };
    return {
      onDrop,
    };
  },
});
