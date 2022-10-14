import { defineComponent, ref, computed, watch, nextTick } from "vue";
import { PushpinOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { PopupStatus } from "@/views/teacher-class/components/lesson-plan/lesson-plan";

const MODAL_CONTENT = "modal-content";
export const PINNING_MODAL_CONTAINER = "pinning-modal-container";
export default defineComponent({
  props: ["position", "onPinOrHide", "status"],
  components: { PushpinOutlined, CloseOutlined },
  setup(props) {
    const pressing = ref(false);
    const pined = computed(() => props.status === PopupStatus.Pinned);
    const showed = computed(() => props.status !== PopupStatus.Hided);
    watch(showed, async (currentVal) => {
      const el = document.querySelector<HTMLElement>(`.${MODAL_CONTENT}`)!;
      if (currentVal) {
        await nextTick();
		// edit modal style below rather than use builtin vue-final-modal "styles" prop to avoid remove resize and drag func.
        el.style.maxHeight = `80vh`;
        el.style.maxWidth = `90vw`;
        el.style.width = `300px`;
        if (el.clientHeight > screen.height - props.position?.top) {
          el.style.height = `${screen.height - props.position?.top - 10}px`;
        }
        el.style.top = `${props.position?.top + 35}px`;
        el.style.left = `${props.position?.left - el.clientWidth / 2 + 10}px`;
      } else {
        pressing.value = false;
      }
    });

    const onMouseDown = (event: any) => {
      pressing.value = true;
      let status = PopupStatus.Pinned;
      if (pined.value) {
        status = PopupStatus.Hided;
      }
      props.onPinOrHide?.(status);
    };
    const onMouseUp = (event: any) => {
      pressing.value = false;
    };
    return { PopupStatus, pined, showed, onMouseDown, onMouseUp, pressing, MODAL_CONTENT, PINNING_MODAL_CONTAINER };
  },
});
