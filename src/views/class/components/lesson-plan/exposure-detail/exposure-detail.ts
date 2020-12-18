import { defineComponent } from "vue";
export default defineComponent({
  emits: ["click-back", "click-media"],
  props:{},
  setup(props, { emit }) {
    const onClickBack = () => {
      emit("click-back");
    };
    const onClickMedia = (id: string) => {
      emit("click-media", { id: id });
    };
    return { onClickBack, onClickMedia };
  },
});
