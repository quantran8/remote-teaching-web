import { defineComponent, ref, onMounted } from "vue";
import { Select, Spin, Modal, Button, Row, Empty } from "ant-design-vue";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fpPromise = FingerprintJS.load();

export default defineComponent({
  props: {
    isTeacher: Boolean,
  },
  components: {
    Select,
    Spin,
    Option: Select.Option,
    Modal,
    Button,
    Row,
    Empty,
  },
  emits: ["on-join-session", "on-cancel"],
  setup(props, { emit }) {
    const visible = ref<boolean>(true);

    const cancel = async () => {
      visible.value = false;
      emit("on-cancel");
    };

    const joinSession = async () => {
      emit("on-join-session");
      console.log("Join sesssion");
    };

    onMounted(async () => {
      console.error("on mouted");
    });

    return {
      cancel,
      joinSession,
    };
  },
});
