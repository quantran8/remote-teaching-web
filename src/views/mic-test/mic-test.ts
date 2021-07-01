import { defineComponent, ref, onMounted, watch } from "vue";
import { Select, Spin, Modal, Button, Row, Empty } from "ant-design-vue";
import { TeacherClassModel, UnitAndLesson } from "@/models";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    isTeacher: Boolean,
    visible: Boolean,
    teacherClass: {
      type: Object as () => TeacherClassModel,
    },
    groupId: String,
    messageStartClass: String,
    unitInfo: {
      type: Object as () => UnitAndLesson[],
    },
    loading: Boolean,
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
    const lessons = ref<number[]>([]);
    const selectedUnit = ref();
    const selectedLesson = ref();

    watch(props, () => {
      if (props.loading == false) {
        if (props.unitInfo) {
          selectedUnit.value = props.unitInfo[0].unit;
          if (props.unitInfo[0].lesson[0]) {
            selectedLesson.value = props.unitInfo[0].lesson[0];
          } else {
            selectedLesson.value = "";
          }
          lessons.value = props.unitInfo[0].lesson;
        } else {
          selectedUnit.value = props.teacherClass?.unit;
          selectedLesson.value = "";
        }
      }
    });

    const handleChangeUnit = async (value: any) => {
      selectedLesson.value = "";
      selectedUnit.value = value;
      const lessonInfo = props.unitInfo?.find((unitSelect: any) => {return unitSelect.unit == value})?.lesson;
      lessons.value = lessonInfo ? lessonInfo : [];
      if (lessons.value) {
        selectedLesson.value = lessons.value[0];
      }
    };

    const handleChangeLesson = async (value: any) => {
      selectedLesson.value = value;
    };

    const cancel = async () => {
      await emit("on-cancel");
    };

    const joinSession = async () => {
      await emit("on-join-session", { unit: selectedUnit.value, lesson: selectedLesson.value });
    };

    return {
      cancel,
      joinSession,
      lessons,
      selectedUnit,
      selectedLesson,
      handleChangeUnit,
      handleChangeLesson,
    };
  },
});
