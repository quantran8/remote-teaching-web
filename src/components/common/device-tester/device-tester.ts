import { defineComponent, computed, ref, onMounted } from "vue";
import { Modal, Switch } from "ant-design-vue";
export default defineComponent({
  components: {
    Modal,
	Switch
  },
  setup() {
    const visible = ref(false);
	const checked = ref<boolean>(false);
    const handleOk = (e: MouseEvent) => {
      visible.value = false;
    };
    const showModal = () => {
      visible.value = true;
    };
    return { visible, handleOk, showModal, checked };
  },
});
