import { defineComponent, ref, onMounted } from "vue";
import { Select, Spin, Modal, Button, Row, Empty } from "ant-design-vue";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fpPromise = FingerprintJS.load();

export default defineComponent({
  props: {
    isTeacher: Boolean,
    visible: Boolean,
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
    const units = ref<{ id: number; number: number }[]>([]);
    const lessons = ref<{ id: number; number: number }[]>([]);
    const selectedUnit = ref(14);
    const selectedLesson = ref(1);

    onMounted(async () => {
      const dummyUnit = [];
      const dummyLesson = [];
      for (let i = 14; i <= 40; i++) {
        dummyUnit.push({ id: i, number: i });
      }
      for (let i = 1; i <= 14; i++) {
        dummyLesson.push({ id: i, number: i });
      }
      units.value = dummyUnit;
      lessons.value = dummyLesson;
    });

    const handleChangeUnit = async (value: any) => {
      selectedUnit.value = value;
    };

    const handleChangeLesson = async (value: any) => {
      selectedLesson.value = value;
    };

    const cancel = async () => {
      emit("on-cancel");
    };

    const joinSession = async () => {
      emit("on-join-session", { unit: selectedUnit.value, lesson: selectedLesson.value });
    };

    return {
      cancel,
      joinSession,
      units,
      lessons,
      selectedUnit,
      selectedLesson,
      handleChangeUnit,
      handleChangeLesson,
    };
  },
});
